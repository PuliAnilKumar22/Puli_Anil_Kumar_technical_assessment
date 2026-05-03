import { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Fade,
    Chip,
} from '@mui/material';
import axios from 'axios';

const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'HubSpot': 'hubspot',
};

export const DataForm = ({ integrationType, credentials }) => {
    const [loadedData, setLoadedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const endpoint = endpointMapping[integrationType];

    const handleLoad = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentials));
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
            const data = response.data;
            setLoadedData(data);
        } catch (e) {
            setError(e?.response?.data?.detail || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }

    const handleClear = () => {
        setLoadedData(null);
        setError(null);
    };

    const itemCount = Array.isArray(loadedData) ? loadedData.length : (loadedData ? 1 : 0);

    return (
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
                        📦
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' }}>
                            Data Explorer
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Fetch and inspect {integrationType} records
                        </Typography>
                    </Box>
                </Box>
                {loadedData && (
                    <Chip
                        label={`${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(88, 101, 242, 0.12)',
                            color: '#a5b4fc',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 26,
                            border: '1px solid rgba(88, 101, 242, 0.2)',
                        }}
                    />
                )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: loadedData || error ? 2.5 : 0 }}>
                <Button
                    onClick={handleLoad}
                    variant="contained"
                    disabled={isLoading}
                    id="load-data-btn"
                    sx={{
                        flex: 1,
                        py: 1.2,
                        fontSize: '0.85rem',
                        background: isLoading
                            ? 'rgba(88, 101, 242, 0.3)'
                            : 'linear-gradient(135deg, #5865f2 0%, #7c3aed 100%)',
                    }}
                >
                    {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            <span>Loading…</span>
                        </Box>
                    ) : (
                        '⬇  Load Data'
                    )}
                </Button>
                {loadedData && (
                    <Button
                        onClick={handleClear}
                        variant="outlined"
                        id="clear-data-btn"
                        sx={{
                            px: 3,
                            borderColor: 'rgba(239, 68, 68, 0.25)',
                            color: '#f87171',
                            '&:hover': {
                                borderColor: 'rgba(239, 68, 68, 0.4)',
                                background: 'rgba(239, 68, 68, 0.06)',
                                boxShadow: 'none',
                                transform: 'none',
                            },
                        }}
                    >
                        Clear
                    </Button>
                )}
            </Box>

            {/* Error Display */}
            {error && (
                <Fade in={true}>
                    <Box
                        sx={{
                            mt: 1,
                            p: 2,
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 500 }}>
                            ⚠️ {error}
                        </Typography>
                    </Box>
                </Fade>
            )}

            {/* Data Display */}
            {loadedData && (
                <Fade in={true} timeout={400}>
                    <Box
                        sx={{
                            borderRadius: '12px',
                            border: '1px solid rgba(99, 115, 180, 0.1)',
                            background: 'rgba(6, 8, 15, 0.6)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Data Header */}
                        <Box
                            sx={{
                                px: 2,
                                py: 1.2,
                                borderBottom: '1px solid rgba(99, 115, 180, 0.08)',
                                background: 'rgba(14, 19, 39, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography variant="caption" sx={{ color: '#8b93a8', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Response Data
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#555d74', fontSize: '0.65rem' }}>
                                JSON
                            </Typography>
                        </Box>

                        {/* Render Data Items */}
                        {Array.isArray(loadedData) ? (
                            <Box sx={{ maxHeight: 420, overflow: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {loadedData.map((item, idx) => (
                                    <Box
                                        key={item?.id || idx}
                                        sx={{
                                            p: 2,
                                            borderRadius: '10px',
                                            border: '1px solid rgba(99, 115, 180, 0.08)',
                                            background: 'rgba(14, 19, 39, 0.35)',
                                            transition: 'all 200ms ease',
                                            animation: `fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 40}ms both`,
                                            '&:hover': {
                                                border: '1px solid rgba(99, 115, 180, 0.18)',
                                                background: 'rgba(14, 19, 39, 0.5)',
                                            },
                                        }}
                                    >
                                        {/* Item header */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #5865f2, #a855f7)',
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#e8ecf4',
                                                        fontSize: '0.82rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: 280,
                                                    }}
                                                >
                                                    {item?.name || item?.id || `Item ${idx + 1}`}
                                                </Typography>
                                            </Box>
                                            {item?.type && (
                                                <Chip
                                                    label={item.type}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.6rem',
                                                        fontWeight: 600,
                                                        backgroundColor: 'rgba(88, 101, 242, 0.1)',
                                                        color: '#a5b4fc',
                                                        border: '1px solid rgba(88, 101, 242, 0.15)',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        {/* Item details */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, pl: 2 }}>
                                            {item?.id && (
                                                <Typography variant="caption" sx={{ color: '#555d74', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                                                    ID: {item.id}
                                                </Typography>
                                            )}
                                            {item?.parent_id && (
                                                <Typography variant="caption" sx={{ color: '#555d74', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                                                    Parent: {item.parent_id}
                                                </Typography>
                                            )}
                                            {item?.creation_time && (
                                                <Typography variant="caption" sx={{ color: '#555d74', fontSize: '0.68rem' }}>
                                                    Created: {item.creation_time}
                                                </Typography>
                                            )}
                                            {item?.last_modified_time && (
                                                <Typography variant="caption" sx={{ color: '#555d74', fontSize: '0.68rem' }}>
                                                    Modified: {item.last_modified_time}
                                                </Typography>
                                            )}
                                            {item?.url && (
                                                <Typography
                                                    variant="caption"
                                                    component="a"
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        color: '#5865f2',
                                                        fontSize: '0.68rem',
                                                        textDecoration: 'none',
                                                        '&:hover': { textDecoration: 'underline', color: '#8b5cf6' },
                                                    }}
                                                >
                                                    🔗 Open link
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                                <Typography
                                    component="pre"
                                    sx={{
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        fontSize: '0.75rem',
                                        lineHeight: 1.6,
                                        color: '#a5b4fc',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        m: 0,
                                    }}
                                >
                                    {JSON.stringify(loadedData, null, 2)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Fade>
            )}
        </Box>
    );
}
