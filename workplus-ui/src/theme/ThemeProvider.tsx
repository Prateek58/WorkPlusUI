import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Components } from '@mui/material/styles';
import userSettingsService, { ThemeColors, UserSettingsState, DEFAULT_THEME_COLORS } from '../Code/Common/services/userSettingsService';

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: {
          border?: string;
          '& .MuiDataGrid-cell'?: {
            borderBottom?: string;
          };
          '& .MuiDataGrid-columnHeaders'?: {
            borderBottom?: string;
          };
        };
        footerContainer?: {
          borderTop?: string;
          padding?: string;
        };
      };
    };
  }
}

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  themeColors: ThemeColors;
  useCustomColors: boolean;
  updateThemeColors: (colors: ThemeColors) => Promise<void>;
  setUseCustomColors: (use: boolean) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
  themeColors: DEFAULT_THEME_COLORS,
  useCustomColors: false,
  updateThemeColors: async () => {},
  setUseCustomColors: async () => {},
  resetToDefaults: async () => {},
  isLoading: true,
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
  const [themeColors, setThemeColors] = useState<ThemeColors>(DEFAULT_THEME_COLORS);
  const [useCustomColors, setUseCustomColorsState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user settings on mount
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await userSettingsService.getCompleteThemeSettings();
        setMode(settings.themeMode);
        setUseCustomColorsState(settings.useCustomColors || false);
        
        if (settings.themeColors) {
          setThemeColors(settings.themeColors);
        }
      } catch (error) {
        console.error('Error loading user theme settings:', error);
        // In incognito mode or when not authenticated, use defaults
        resetToDefaultsState();
      } finally {
        setIsLoading(false);
      }
    };

    const resetToDefaultsState = () => {
      setMode('dark');
      setThemeColors(DEFAULT_THEME_COLORS);
      setUseCustomColorsState(false);
    };

    // Check if user is authenticated in multiple ways
    const checkAuthentication = () => {
      const token = localStorage.getItem('token');
      
      // Check if localStorage is accessible (might fail in some incognito modes)
      try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
      } catch (e) {
        console.warn('localStorage not available - likely in incognito mode');
        setIsLoading(false);
        return false;
      }
      
      return token !== null;
    };

    if (checkAuthentication()) {
      loadUserSettings();
    } else {
      console.log('User not authenticated or localStorage unavailable - using default theme settings');
      resetToDefaultsState();
      setIsLoading(false);
    }
  }, []);

  // Listen for authentication changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('Authentication state changed, reloading theme settings');
        
        if (e.newValue) {
          // User logged in - reload settings
          setIsLoading(true);
          userSettingsService.getCompleteThemeSettings()
            .then(settings => {
              setMode(settings.themeMode);
              setUseCustomColorsState(settings.useCustomColors || false);
              
              if (settings.themeColors) {
                setThemeColors(settings.themeColors);
              }
            })
            .catch(error => {
              console.error('Error loading theme settings after login:', error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          // User logged out - reset to defaults
          console.log('User logged out - resetting to default theme');
          setMode('dark');
          setThemeColors(DEFAULT_THEME_COLORS);
          setUseCustomColorsState(false);
        }
      }
    };

    // Listen for localStorage changes (when user logs in/out in same tab)
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab login/logout
    const handleAuthChange = () => {
      handleStorageChange({ key: 'token', newValue: localStorage.getItem('token') } as StorageEvent);
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const toggleColorMode = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    
    // Save to user settings
    try {
      await userSettingsService.setThemeMode(newMode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const updateThemeColors = async (colors: ThemeColors) => {
    setThemeColors(colors);
    try {
      await userSettingsService.setThemeColors(colors);
    } catch (error) {
      console.error('Error saving theme colors:', error);
    }
  };

  const setUseCustomColors = async (use: boolean) => {
    setUseCustomColorsState(use);
    try {
      const settings: UserSettingsState = {
        themeMode: mode,
        themeColors: use ? themeColors : undefined,
        useCustomColors: use
      };
      await userSettingsService.saveCompleteThemeSettings(settings);
    } catch (error) {
      console.error('Error saving custom colors setting:', error);
    }
  };

  const resetToDefaults = async () => {
    setMode('dark');
    setThemeColors(DEFAULT_THEME_COLORS);
    setUseCustomColorsState(false);
    try {
      await userSettingsService.resetThemeToDefaults();
    } catch (error) {
      console.error('Error resetting theme to defaults:', error);
    }
  };

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode,
      themeColors,
      useCustomColors,
      updateThemeColors,
      setUseCustomColors,
      resetToDefaults,
      isLoading,
    }),
    [mode, themeColors, useCustomColors, isLoading]
  );

  // Determine which colors to use
  const activeColors = useCustomColors ? themeColors : DEFAULT_THEME_COLORS;
  const currentModeColors = activeColors[mode];

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: currentModeColors.primary,
          },
          secondary: {
            main: currentModeColors.secondary,
          },
          background: {
            default: currentModeColors.background,
            paper: currentModeColors.surface,
          },
          text: {
            primary: currentModeColors.text,
            secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          },
          // Auto-derive accent/warning colors
          warning: {
            main: currentModeColors.accent,
          },
          error: {
            main: mode === 'dark' ? '#f44336' : '#d32f2f',
          },
          info: {
            main: mode === 'dark' ? '#29b6f6' : '#1976d2',
          },
          success: {
            main: mode === 'dark' ? '#66bb6a' : '#2e7d32',
          },
          appBar: {
            main: currentModeColors.background,
          },
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
          // NOTE: Loader styling is preserved by keeping it in a separate CSS file
          // The loader uses hardcoded colors and is not affected by theme changes
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
                backgroundColor: currentModeColors.surface,
                boxShadow: mode === 'light' 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.05)'
                  : '0px 2px 8px rgba(0, 0, 0, 0.25)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: currentModeColors.surface,
                borderRight: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
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
          MuiCssBaseline: {
            styleOverrides: {
              '*': {
                boxSizing: 'border-box',
              },
              html: {
                margin: 0,
                padding: 0,
                width: '100%',
                height: '100%',
                backgroundColor: currentModeColors.background,
              },
              body: {
                margin: 0,
                padding: 0,
                width: '100%',
                height: '100%',
                backgroundColor: currentModeColors.background,
                minHeight: '100vh',
                '& #root': {
                  minHeight: '100vh',
                  backgroundColor: currentModeColors.background,
                },
              },
              '#root': {
                width: '100%',
                height: '100%',
                minHeight: '100vh',
                backgroundColor: currentModeColors.background,
                display: 'flex',
                flexDirection: 'column',
              },
              '.MuiDialog-paper': {
                backgroundColor: `${currentModeColors.surface} !important`,
                backgroundImage: 'none !important',
              },
              'input': {
                '&[type=number]': {
                  MozAppearance: 'textfield',
                  '&::-webkit-outer-spin-button': {
                    margin: 0,
                    WebkitAppearance: 'none',
                  },
                  '&::-webkit-inner-spin-button': {
                    margin: 0,
                    WebkitAppearance: 'none',
                  },
                },
              },
              'img': {
                display: 'block',
                maxWidth: '100%',
              },
              '*::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
              },
              '*::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '*::-webkit-scrollbar-thumb': {
                background: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                borderRadius: '3px',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
                },
              },
            },
          },
        },
        spacing: 4,
      }),
    [mode, currentModeColors]
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