import { createTheme, alpha } from '@mui/material/styles';
import type { Theme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface CustomTheme extends Theme {
    customShadows: {
      card: string;
      dialog: string;
      dropdown: string;
    };
    customBorderRadius: {
      small: number;
      medium: number;
      large: number;
    };
    customSpacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  }
  
  interface CustomThemeOptions extends ThemeOptions {
    customShadows?: {
      card?: string;
      dialog?: string;
      dropdown?: string;
    };
    customBorderRadius?: {
      small?: number;
      medium?: number;
      large?: number;
    };
    customSpacing?: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
  }
  
  export function createTheme(options?: CustomThemeOptions): CustomTheme;
}

// Common color variables
const PRIMARY_MAIN = '#6E62E5';
const PRIMARY_DARK = '#5048A8';
const PRIMARY_LIGHT = '#9188EB';
const SECONDARY_MAIN = '#FF8A00';
const ERROR_MAIN = '#FF5252';
const SUCCESS_MAIN = '#4CAF50';
const INFO_MAIN = '#2196F3';
const WARNING_MAIN = '#FFC107';

// Common spacing
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Common border radius
const BORDER_RADIUS = {
  small: 0,
  medium: 0,
  large: 8,
};

export const getTheme = (mode: 'light' | 'dark') => {
  // Mode specific variables  
  const TEXT_PRIMARY = mode === 'light' ? '#11142D' : '#FFFFFF';
  const TEXT_SECONDARY = mode === 'light' ? '#808191' : '#A0A3BD';
  const BORDER_COLOR = mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  const HOVER_BACKGROUND = mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)';
  const BACKGROUND_DEFAULT = mode === 'light' ? '#f5f5f5' : '#1a237e';
  
  const SHADOWS = {
    card: mode === 'light' 
      ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
      : '0px 4px 20px rgba(0, 0, 0, 0.25)',
    dialog: mode === 'light'
      ? '0px 8px 30px rgba(0, 0, 0, 0.12)'
      : '0px 8px 30px rgba(0, 0, 0, 0.5)',
    dropdown: mode === 'light'
      ? '0px 2px 8px rgba(0, 0, 0, 0.1)'
      : '0px 2px 8px rgba(0, 0, 0, 0.25)',
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        main: PRIMARY_MAIN,
        light: PRIMARY_LIGHT,
        dark: PRIMARY_DARK,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: SECONDARY_MAIN,
        contrastText: '#FFFFFF',
      },
      error: {
        main: ERROR_MAIN,
      },
      success: {
        main: SUCCESS_MAIN,
      },
      info: {
        main: INFO_MAIN,
      },
      warning: {
        main: WARNING_MAIN,
      },
      background: {
 
      },
      text: {
        primary: TEXT_PRIMARY,
        secondary: TEXT_SECONDARY,
      },
      divider: BORDER_COLOR,
      action: {
        hover: HOVER_BACKGROUND,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1.1rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
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
    shape: {
      borderRadius: BORDER_RADIUS.small,
    },
    spacing: (factor: number) => `${SPACING.sm * factor}px`,
    customShadows: SHADOWS,
    customBorderRadius: BORDER_RADIUS,
    customSpacing: SPACING,
    components: {
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
          '.MuiDialog-paper': {
            backgroundColor: `${BACKGROUND_DEFAULT} !important`,
            backgroundImage: 'none !important',
          },
          // Table header styling - more direct approach
          'thead tr th': {
            backgroundColor: `${mode === 'light' ? '#f5f5f5' : '#2c2c2c'} !important`,
            fontWeight: '600 !important',
            color: `${TEXT_PRIMARY} !important`,
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
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: BORDER_RADIUS.small,
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          outlined: {
            borderWidth: 1,
          },
          sizeLarge: {
            padding: `${SPACING.sm}px ${SPACING.md + 4}px`,
            fontSize: '0.9rem',
          },
          sizeSmall: {
            padding: `${SPACING.xs}px ${SPACING.sm}px`,
            fontSize: '0.8rem',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none !important',
            borderRadius: BORDER_RADIUS.medium,
          },
          rounded: {
            borderRadius: BORDER_RADIUS.medium,
          },
          outlined: {
            borderColor: BORDER_COLOR,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            padding: SPACING.md,
            boxShadow: SHADOWS.card,
            borderRadius: BORDER_RADIUS.medium,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            '& .MuiToggleButtonGroup-grouped': {
              '&:not(:first-of-type)': {
                borderRadius: BORDER_RADIUS.small,
              },
              '&:first-of-type': {
                borderRadius: BORDER_RADIUS.small,
              },
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            color: TEXT_SECONDARY,
            '&.Mui-selected': {
              color: PRIMARY_MAIN,
              backgroundColor: alpha(PRIMARY_MAIN, 0.1),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: BORDER_RADIUS.small,
              '& fieldset': {
                borderColor: BORDER_COLOR,
              },
              '&:hover fieldset': {
                borderColor: PRIMARY_LIGHT,
              },
              '&.Mui-focused fieldset': {
                borderColor: PRIMARY_MAIN,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            borderRadius: BORDER_RADIUS.small,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.small,
          },
          standardSuccess: {
            backgroundColor: alpha(SUCCESS_MAIN, 0.1),
            color: mode === 'light' ? SUCCESS_MAIN : alpha(SUCCESS_MAIN, 0.8),
          },
          standardError: {
            backgroundColor: alpha(ERROR_MAIN, 0.1),
            color: mode === 'light' ? ERROR_MAIN : alpha(ERROR_MAIN, 0.8),
          },
          standardWarning: {
            backgroundColor: alpha(WARNING_MAIN, 0.1),
            color: mode === 'light' ? WARNING_MAIN : alpha(WARNING_MAIN, 0.8),
          },
          standardInfo: {
            backgroundColor: alpha(INFO_MAIN, 0.1),
            color: mode === 'light' ? INFO_MAIN : alpha(INFO_MAIN, 0.8),
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            boxShadow: SHADOWS.dropdown,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            boxShadow: SHADOWS.dialog,
     },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            boxShadow: SHADOWS.dropdown,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.small,
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
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' ? 'none' : '0px 1px 5px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: '64px !important',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: TEXT_SECONDARY,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          circle: {
            strokeLinecap: 'round',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: BORDER_COLOR,
          },
        },
      },
    },
  });
}; 