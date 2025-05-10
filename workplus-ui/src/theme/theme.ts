import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode colors
            primary: {
              main: '#6E62E5',
            },
            background: {
              default: '#F6F6F9',
              paper: '#FFFFFF',
            },
            text: {
              primary: '#11142D',
              secondary: '#808191',
            },
          }
        : {
            // Dark mode colors
            primary: {
              main: '#6E62E5',
            },
            background: {
              default: '#1C1C25',
              paper: '#28293D',
            },
            text: {
              primary: '#FFFFFF',
              secondary: '#808191',
            },
          }),
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
        
            boxShadow: mode === 'light' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
              : '0px 4px 20px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
  });
}; 