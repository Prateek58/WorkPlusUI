import { SxProps, Theme, alpha } from '@mui/material/styles';

// Using CustomTheme type from theme.ts
interface CustomTheme extends Theme {
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
}

// Common form field styles
export const formFieldStyles = (theme: Theme): SxProps => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: (theme as CustomTheme).customBorderRadius?.small || theme.shape.borderRadius,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'light' 
        ? 'rgba(0, 0, 0, 0.23)' 
        : 'rgba(255, 255, 255, 0.23)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
});

// Common card styles - reduced border radius
export const cardStyles = (theme: Theme): SxProps => ({
  p: 3,
  borderRadius: (theme as CustomTheme).customBorderRadius?.small || theme.shape.borderRadius,
  boxShadow: (theme as CustomTheme).customShadows?.card || theme.shadows[1],
  height: '100%',
});

// Common section title styles
export const sectionTitleStyles = (theme: Theme): SxProps => ({
  mb: 3,
  mt:4,
  color: theme.palette.text.primary,
  fontWeight: 600,
});

// Common button styles
export const buttonStyles = (theme: Theme): SxProps => ({
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
});

// Common alert styles
export const alertStyles = (theme: Theme): SxProps => ({
  mb: 2,
  borderRadius: (theme as CustomTheme).customBorderRadius?.small || theme.shape.borderRadius,
});

// Flex container styles
export const flexContainerStyles = {
  display: 'flex',
  alignItems: 'center',
};

// Centered content styles
export const centeredContentStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

// Common form container styles - reduced border radius
export const formContainerStyles = (theme: Theme): SxProps => ({
  p: 3,
  mb: 4,
  borderRadius: (theme as CustomTheme).customBorderRadius?.small || theme.shape.borderRadius,
  boxShadow: (theme as CustomTheme).customShadows?.card || theme.shadows[1],
  bgcolor: theme.palette.background.paper,
});

// Table cell styles
 

// Common input field height
export const inputHeight = '45px';

// Common icon button styles 
export const iconButtonStyles = (theme: Theme): SxProps => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
});

// Login form specific styles
export const loginFormStyles = (theme: Theme): SxProps => ({
  width: '100%',
  maxWidth: '440px',
  mx: 'auto',
  p: 4,
  bgcolor: '#ffffff',
  color: 'rgba(0, 0, 0, 0.87)',
  borderRadius: (theme as CustomTheme).customBorderRadius?.small || theme.shape.borderRadius,
  boxShadow: (theme as CustomTheme).customShadows?.card || theme.shadows[3],
  backdropFilter: 'blur(10px)',
  '& .MuiTypography-root': {
    color: 'rgba(0, 0, 0, 0.87)',
  },
  '& .MuiTypography-colorTextSecondary': {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  '& .MuiFormLabel-root': {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.23)',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.23)',
  },
  '& .MuiIconButton-root': {
    color: 'rgba(0, 0, 0, 0.54)',
  },
});

// Social login button styles
export const socialButtonStyles = (theme: Theme): SxProps => ({
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: (theme as CustomTheme).customBorderRadius?.small || theme.shape.borderRadius,
  p: 1.5,
  bgcolor: '#ffffff',
  '&:hover': {
    bgcolor: 'rgba(0, 0, 0, 0.04)',
  },
}); 