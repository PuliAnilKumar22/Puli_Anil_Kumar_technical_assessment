import { useState, useCallback } from 'react';
import {
    Box,
    Autocomplete,
    TextField,
    Typography,
    Chip,
    Fade,
} from '@mui/material';
import { AirtableIntegration } from './integrations/airtable';
import { NotionIntegration } from './integrations/notion';
import { HubspotIntegration } from './integrations/hubspot';
import { DataForm } from './data-form';

const integrationMapping = {
    'Notion': NotionIntegration,
    'Airtable': AirtableIntegration,
    'HubSpot': HubspotIntegration,
};

const integrationIcons = {
    'Notion': '📝',
    'Airtable': '📊',
    'HubSpot': '🔶',
};

const integrationDescriptions = {
    'Notion': 'Workspace & databases',
    'Airtable': 'Spreadsheets & records',
    'HubSpot': 'CRM & contacts',
};

export const IntegrationForm = () => {
    const [integrationParams, setIntegrationParams] = useState({});
    const [user, setUser] = useState('TestUser');
    const [org, setOrg] = useState('TestOrg');
    const [currType, setCurrType] = useState(null);
    const CurrIntegration = integrationMapping[currType];

    // Reset connection state when integration type changes
    const handleTypeChange = useCallback((e, value) => {
        setCurrType(value);
        // Clear previous integration credentials and loaded data
        setIntegrationParams({});
    }, []);

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 520,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                animation: 'fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both',
            }}
        >
            {/* Configuration Card */}
            <Box
                sx={{
                    background: 'rgba(14, 19, 39, 0.55)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(99, 115, 180, 0.12)',
                    borderRadius: '16px',
                    p: { xs: 2.5, sm: 3.5 },
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        border: '1px solid rgba(99, 115, 180, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    },
                }}
            >
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                        }}
                    >
                        ⚙️
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' }}>
                            Configuration
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Set your identity and select an integration
                        </Typography>
                    </Box>
                </Box>

                {/* Input Fields */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                    <TextField
                        label="User"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        size="small"
                        fullWidth
                        id="user-input"
                    />
                    <TextField
                        label="Organization"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        size="small"
                        fullWidth
                        id="org-input"
                    />
                </Box>

                {/* Integration Type Selector */}
                <Autocomplete
                    id="integration-type"
                    options={Object.keys(integrationMapping)}
                    value={currType}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Integration Type"
                            size="small"
                            placeholder="Choose a platform..."
                        />
                    )}
                    renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    background: 'rgba(88, 101, 242, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    flexShrink: 0,
                                }}
                            >
                                {integrationIcons[option]}
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#e8ecf4', lineHeight: 1.3 }}>
                                    {option}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#8b93a8', fontSize: '0.7rem' }}>
                                    {integrationDescriptions[option]}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    onChange={handleTypeChange}
                    fullWidth
                />
            </Box>

            {/* Integration Connection Card */}
            {currType && (
                <Fade in={true} timeout={400}>
                    <Box
                        sx={{
                            background: 'rgba(14, 19, 39, 0.55)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(99, 115, 180, 0.12)',
                            borderRadius: '16px',
                            p: { xs: 2.5, sm: 3.5 },
                            animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '1px solid rgba(99, 115, 180, 0.2)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                            },
                        }}
                    >
                        {/* Section Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    🔗
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' }}>
                                        {currType} Connection
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                        Authenticate with {currType}
                                    </Typography>
                                </Box>
                            </Box>
                            {integrationParams?.credentials && (
                                <Chip
                                    label="Connected"
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                        color: '#22c55e',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: 26,
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        animation: 'pulseGlow 3s ease-in-out infinite',
                                    }}
                                />
                            )}
                        </Box>

                        <CurrIntegration
                            user={user}
                            org={org}
                            integrationParams={integrationParams}
                            setIntegrationParams={setIntegrationParams}
                        />
                    </Box>
                </Fade>
            )}

            {/* Data Section */}
            {integrationParams?.credentials && (
                <Fade in={true} timeout={500}>
                    <Box
                        sx={{
                            animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both',
                        }}
                    >
                        <DataForm integrationType={integrationParams?.type} credentials={integrationParams?.credentials} />
                    </Box>
                </Fade>
            )}
        </Box>
    );
}
