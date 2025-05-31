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
        // Use defaults if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    // Only load settings if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      loadUserSettings();
    } else {
      setIsLoading(false);
    }
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
    setMode('light');
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
              },
              body: {
                margin: 0,
                padding: 0,
                width: '100%',
                height: '100%',
              },
              '#root': {
                width: '100%',
                height: '100%',
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
    [mode, currentModeColors.primary, currentModeColors.secondary, currentModeColors.accent, currentModeColors.background, currentModeColors.surface, currentModeColors.text]
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