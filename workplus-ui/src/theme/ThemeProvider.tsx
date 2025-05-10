import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
});

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                primary: {
                  main: '#90caf96e',
                },
                secondary: {
                  main: '#f48fb1',
                },
                background: {
                  default: '#0a1929',
                  paper: '#1a2148',
                },
              }
            : {
                primary: {
                  main: '#261c68',
                },
                secondary: {
                  main: '#dc004e',
                },
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontSize: '1.5rem',
            lineHeight: 1.2,
            fontWeight: 600,
          },
          h6: {
            fontSize: '1.1rem',
            lineHeight: 1.2,
            fontWeight: 600,
          },
          body1: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
          body2: {
            fontSize: '0.75rem',
            lineHeight: 1.5,
          },
          button: {
            fontSize: '0.875rem',
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                padding: '6px 16px',
                height: '32px',
            
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiToggleButtonGroup: {
            styleOverrides: {
              root: {
                height: '36px',
                '& .MuiToggleButton-root': {
                  height: '36px',
                  padding: '6px 16px',
                  borderRadius: 0,
                  border: '1',
                  '&.Mui-selected': {
                    backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)',
                    color: mode === 'light' ? '#1976d2' : '#90caf9',
                    '&:hover': {
                      backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(144, 202, 249, 0.12)',
                    },
                  },
                },
              },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  height: '36px',
                  borderRadius: 4,
                },
                '& .MuiInputLabel-root': {
                  transform: 'translate(14px, 8px) scale(1)',
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                  },
                },
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                height: '36px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: 4,
                },
                '& .MuiSelect-select': {
                  padding: '8px 14px',
                  height: '20px',
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                transform: 'translate(14px, 8px) scale(1)',
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                
                padding: '1rem',
                boxShadow: mode === 'light' 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.05)'
                  : '0px 2px 8px rgba(0, 0, 0, 0.25)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                width: 240,
                borderRight: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                height: 56,
                boxShadow: 'none',
              },
            },
          },
          MuiToolbar: {
            styleOverrides: {
              root: {
                minHeight: '56px !important',
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                padding: '8px 16px',
                minHeight: 40,
              },
            },
          },
          MuiListItemIcon: {
            styleOverrides: {
              root: {
                minWidth: 36,
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
               
                boxShadow: mode === 'light'
                  ? '0px 2px 8px rgba(0, 0, 0, 0.1)'
                  : '0px 2px 8px rgba(0, 0, 0, 0.25)',
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                padding: '8px 16px',
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': {
                  minWidth: 36,
                },
              },
            },
          },
          MuiDataGrid: {
            styleOverrides: {
              root: {
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
                },
                '& .MuiDataGrid-columnHeaders': {
                  borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
                },
              },
              footerContainer: {
                borderTop: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
                padding: '8px 16px',
              },
            },
          },
        },
        spacing: 4,
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 