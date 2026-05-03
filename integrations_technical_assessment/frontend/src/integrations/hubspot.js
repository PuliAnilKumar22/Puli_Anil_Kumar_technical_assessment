// hubspot.js

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
} from '@mui/material';
import axios from 'axios';

export const HubspotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Function to open OAuth in a new window
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'HubSpot Authorization', 'width=600, height=600');

            // Polling for the window to close
            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) { 
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    // Function to handle logic when the OAuth window closes
    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/credentials`, formData);
            const credentials = response.data; 
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'HubSpot' }));
            }
            setIsConnecting(false);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    useEffect(() => {
        // Reset connection state when component mounts (integration type changed)
        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 1,
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: isConnected
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(88, 101, 242, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    transition: 'all 400ms ease',
                    border: isConnected
                        ? '1px solid rgba(34, 197, 94, 0.2)'
                        : '1px solid rgba(99, 115, 180, 0.1)',
                }}
            >
                🔶
            </Box>

            {!isConnected && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', textAlign: 'center' }}>
                    Authorize access to your HubSpot CRM
                </Typography>
            )}

            <Button 
                variant="contained"
                onClick={isConnected ? () => {} : handleConnectClick}
                disabled={isConnecting}
                id="hubspot-connect-btn"
                sx={{
                    minWidth: 200,
                    py: 1.2,
                    pointerEvents: isConnected ? 'none' : 'auto',
                    cursor: isConnected ? 'default' : 'pointer',
                    background: isConnected
                        ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                        : 'linear-gradient(135deg, #5865f2 0%, #7c3aed 100%)',
                    '&:hover': {
                        background: isConnected
                            ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                            : 'linear-gradient(135deg, #6c78f5 0%, #8b5cf6 100%)',
                        boxShadow: isConnected
                            ? '0 4px 20px rgba(34, 197, 94, 0.25)'
                            : '0 4px 20px rgba(88, 101, 242, 0.25)',
                    },
                    opacity: isConnected ? 1 : undefined,
                }}
            >
                {isConnected ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>✓</span>
                        <span>HubSpot Connected</span>
                    </Box>
                ) : isConnecting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                        <span>Connecting…</span>
                    </Box>
                ) : (
                    'Connect to HubSpot'
                )}
            </Button>
        </Box>
    );
}
