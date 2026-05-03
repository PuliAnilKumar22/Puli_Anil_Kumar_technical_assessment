# hubspot.py

import json
import os
import secrets
import asyncio
import base64

import httpx
import requests
from dotenv import load_dotenv
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse

from integrations.integration_item import IntegrationItem
from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

load_dotenv()

# ---------------------------------------------------------------------------
# App credentials – loaded from .env file
# ---------------------------------------------------------------------------
CLIENT_ID = os.environ.get('HUBSPOT_CLIENT_ID', '')
CLIENT_SECRET = os.environ.get('HUBSPOT_CLIENT_SECRET', '')
REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'

# Scopes requested from HubSpot
SCOPES = 'crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read'

AUTHORIZATION_URL = (
    f'https://app.hubspot.com/oauth/authorize'
    f'?client_id={CLIENT_ID}'
    f'&redirect_uri={REDIRECT_URI}'
    f'&scope={SCOPES.replace(" ", "%20")}'
)

TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token'


# ---------------------------------------------------------------------------
# Part 1 – OAuth helpers
# ---------------------------------------------------------------------------

async def authorize_hubspot(user_id, org_id):
    """
    Generate a random CSRF state token, persist it to Redis, and return the
    HubSpot authorization URL that the frontend should open in a pop-up window.
    """
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id,
    }
    encoded_state = base64.urlsafe_b64encode(
        json.dumps(state_data).encode('utf-8')
    ).decode('utf-8')

    await add_key_value_redis(
        f'hubspot_state:{org_id}:{user_id}',
        json.dumps(state_data),
        expire=600,
    )

    auth_url = f'{AUTHORIZATION_URL}&state={encoded_state}'
    return auth_url


async def oauth2callback_hubspot(request: Request):
    """
    HubSpot redirects to this endpoint after the user grants consent.
    We validate the CSRF state, exchange the authorisation code for tokens,
    and store the credentials in Redis before closing the pop-up window.
    """
    if request.query_params.get('error'):
        raise HTTPException(
            status_code=400,
            detail=request.query_params.get('error_description', 'OAuth error'),
        )

    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')

    if not code or not encoded_state:
        raise HTTPException(status_code=400, detail='Missing code or state parameter.')

    # Decode the state blob sent back from HubSpot
    try:
        state_data = json.loads(
            base64.urlsafe_b64decode(encoded_state).decode('utf-8')
        )
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid state encoding.')

    original_state = state_data.get('state')
    user_id = state_data.get('user_id')
    org_id = state_data.get('org_id')

    # Validate against the value we stored in Redis
    saved_state = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')
    if not saved_state or original_state != json.loads(saved_state).get('state'):
        raise HTTPException(status_code=400, detail='State does not match.')

    # Exchange the authorisation code for an access token
    async with httpx.AsyncClient() as client:
        response, _ = await asyncio.gather(
            client.post(
                TOKEN_URL,
                data={
                    'grant_type': 'authorization_code',
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET,
                    'redirect_uri': REDIRECT_URI,
                    'code': code,
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
            ),
            delete_key_redis(f'hubspot_state:{org_id}:{user_id}'),
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f'Token exchange failed: {response.text}',
        )

    await add_key_value_redis(
        f'hubspot_credentials:{org_id}:{user_id}',
        json.dumps(response.json()),
        expire=600,
    )

    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)


async def get_hubspot_credentials(user_id, org_id):
    """
    Retrieve the stored HubSpot credentials from Redis and return them.
    Credentials are deleted from Redis after retrieval (one-time read).
    """
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    credentials = json.loads(credentials)
    await delete_key_redis(f'hubspot_credentials:{org_id}:{user_id}')
    return credentials


# ---------------------------------------------------------------------------
# Part 2 – Load HubSpot items
# ---------------------------------------------------------------------------

def create_integration_item_metadata_object(
    response_json: dict,
    item_type: str,
    parent_id: str = None,
    parent_name: str = None,
) -> IntegrationItem:
    """
    Map a raw HubSpot CRM object dict to an IntegrationItem.

    HubSpot CRM objects share a common envelope:
      {
        "id": "...",
        "properties": { ... },
        "createdAt": "...",
        "updatedAt": "...",
      }
    The 'name' is derived from the most relevant property for each object type.
    """
    props = response_json.get('properties', {})

    # Build a human-readable name depending on object type
    if item_type == 'Contact':
        first = props.get('firstname', '') or ''
        last = props.get('lastname', '') or ''
        name = f'{first} {last}'.strip() or props.get('email', 'Unknown Contact')
    elif item_type == 'Company':
        name = props.get('name', 'Unknown Company')
    elif item_type == 'Deal':
        name = props.get('dealname', 'Unknown Deal')
    else:
        name = props.get('name', item_type)

    # HubSpot URL patterns
    type_to_path = {
        'Contact': 'contacts',
        'Company': 'companies',
        'Deal': 'deals',
    }
    record_id = response_json.get('id')
    url = (
        f'https://app.hubspot.com/{type_to_path.get(item_type, "crm")}/{record_id}'
        if record_id
        else None
    )

    return IntegrationItem(
        id=f'{record_id}_{item_type}' if record_id else None,
        name=name,
        type=item_type,
        parent_id=parent_id,
        parent_path_or_name=parent_name,
        creation_time=response_json.get('createdAt'),
        last_modified_time=response_json.get('updatedAt'),
        url=url,
    )


def _fetch_hubspot_objects(
    access_token: str,
    object_type: str,
    properties: list,
    aggregated: list,
) -> None:
    """
    Page through a HubSpot CRM v3 list endpoint and collect all records.
    `object_type` is one of: contacts, companies, deals.
    """
    url = f'https://api.hubapi.com/crm/v3/objects/{object_type}'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {
        'limit': 100,
        'properties': ','.join(properties),
    }

    while True:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            print(
                f'[HubSpot] Failed to fetch {object_type}: '
                f'{response.status_code} {response.text}'
            )
            break

        data = response.json()
        results = data.get('results', [])
        aggregated.extend(results)

        # Follow pagination cursor
        paging = data.get('paging', {})
        next_cursor = paging.get('next', {}).get('after')
        if not next_cursor:
            break
        params['after'] = next_cursor


async def get_items_hubspot(credentials) -> list[IntegrationItem]:
    """
    Query HubSpot CRM for Contacts, Companies, and Deals, then convert each
    record into an IntegrationItem and return the full list.
    """
    credentials = json.loads(credentials)
    access_token = credentials.get('access_token')

    if not access_token:
        raise HTTPException(status_code=400, detail='No access token in credentials.')

    # -----------------------------------------------------------------------
    # Define what to fetch: (object_type, label, properties_to_request)
    # -----------------------------------------------------------------------
    object_configs = [
        (
            'contacts',
            'Contact',
            ['firstname', 'lastname', 'email', 'phone', 'lifecyclestage'],
        ),
        (
            'companies',
            'Company',
            ['name', 'domain', 'industry', 'city', 'country'],
        ),
        (
            'deals',
            'Deal',
            ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline'],
        ),
    ]

    list_of_integration_items: list[IntegrationItem] = []

    for object_type, label, properties in object_configs:
        raw_records: list = []
        _fetch_hubspot_objects(access_token, object_type, properties, raw_records)

        for record in raw_records:
            item = create_integration_item_metadata_object(record, label)
            list_of_integration_items.append(item)

    print(
        f'[HubSpot] Loaded {len(list_of_integration_items)} integration items:'
    )
    for item in list_of_integration_items:
        print(
            f'  [{item.type}] id={item.id}  name={item.name!r}  '
            f'url={item.url}  created={item.creation_time}'
        )

    return list_of_integration_items