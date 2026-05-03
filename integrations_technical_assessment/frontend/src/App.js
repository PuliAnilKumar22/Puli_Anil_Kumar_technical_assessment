import { IntegrationForm } from './integration-form';
import { createTheme, ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5865f2', light: '#8b5cf6', dark: '#4752c4' },
    secondary: { main: '#a855f7' },
    success: { main: '#22c55e', dark: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: { default: '#06080f', paper: 'rgba(14, 19, 39, 0.65)' },
    text: { primary: '#e8ecf4', secondary: '#8b93a8' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500 },
    body1: { fontWeight: 400, lineHeight: 1.6 },
    body2: { fontWeight: 400, lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#06080f' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 20px rgba(88, 101, 242, 0.25)', transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #5865f2 0%, #7c3aed 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #6c78f5 0%, #8b5cf6 100%)' },
        },
        outlined: {
          borderColor: 'rgba(99, 115, 180, 0.25)',
          '&:hover': { borderColor: 'rgba(120, 140, 220, 0.4)', background: 'rgba(88, 101, 242, 0.06)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(12, 16, 34, 0.6)',
            backdropFilter: 'blur(8px)',
            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': { borderColor: 'rgba(99, 115, 180, 0.15)', transition: 'border-color 250ms ease' },
            '&:hover fieldset': { borderColor: 'rgba(99, 115, 180, 0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#5865f2', borderWidth: '1.5px' },
          },
          '& .MuiInputLabel-root': { color: '#8b93a8', fontWeight: 500, fontSize: '0.875rem' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#a5b4fc' },
          '& .MuiOutlinedInput-input': { color: '#e8ecf4', fontSize: '0.9rem' },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(14, 19, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 115, 180, 0.15)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          marginTop: 4,
        },
        option: {
          borderRadius: 8,
          margin: '2px 6px',
          padding: '10px 14px !important',
          transition: 'all 150ms ease',
          '&:hover': { backgroundColor: 'rgba(88, 101, 242, 0.12) !important' },
          '&[aria-selected="true"]': { backgroundColor: 'rgba(88, 101, 242, 0.18) !important' },
        },
        listbox: { padding: '6px' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 4, md: 6 },
          pb: 6,
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 5,
            animation: 'fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #5865f2 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 4px 16px rgba(88, 101, 242, 0.35)',
              }}
            >
              VS
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #e8ecf4 30%, #a5b4fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              VectorShift
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontWeight: 400, letterSpacing: '0.02em' }}
          >
            Integration Hub
          </Typography>
        </Box>

        {/* Main Content */}
        <IntegrationForm />
      </Box>
    </ThemeProvider>
  );
}

export default App;
