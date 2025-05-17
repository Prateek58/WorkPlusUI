# WorkPlus Styling Guide

## Overview

This guide explains the WorkPlus styling system, which uses Material-UI's theming capabilities enhanced with custom utilities to ensure consistent styling across the application.

## Theme System

Our theme system is built on top of Material-UI's theming system with the following enhancements:

1. **Custom theme properties**:
   - `customShadows`: Predefined shadows for cards, dialogs, and dropdowns
   - `customBorderRadius`: Standardized border radius values (small, medium, large)
   - `customSpacing`: Standardized spacing values (xs, sm, md, lg, xl)

2. **Style utilities**: Reusable style functions in `styleUtils.ts` for common UI patterns

## Border Radius Values

We use consistent border radius values throughout the application:
- Small: 2px (used for buttons, inputs, alerts)
- Medium: 4px (used for modals, popovers)
- Large: 8px (used for special elements)

## Spacing

Our spacing scale uses 8px as a base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Colors

Our theme defines standard colors for:
- Primary: `#6E62E5` (purplish blue)
- Secondary: `#FF8A00` (orange)
- Error: `#FF5252` (red)
- Success: `#4CAF50` (green)
- Info: `#2196F3` (blue)
- Warning: `#FFC107` (yellow)

The theme automatically handles light/dark mode color adjustments.

## Style Utilities

Use the style utility functions in `styleUtils.ts` for consistent styling:

### Form Elements

```tsx
import { formFieldStyles } from '../../../theme/styleUtils';

// In your component:
<TextField
  label="Name"
  sx={formFieldStyles(theme)}
/>
```

### Cards

```tsx
import { cardStyles } from '../../../theme/styleUtils';

// In your component:
<Card sx={cardStyles(theme)}>
  {/* Card content */}
</Card>
```

### Containers

```tsx
import { formContainerStyles } from '../../../theme/styleUtils';

// In your component:
<Paper sx={formContainerStyles(theme)}>
  {/* Form content */}
</Paper>
```

### Alerts

```tsx
import { alertStyles } from '../../../theme/styleUtils';

// In your component:
<Alert severity="error" sx={alertStyles(theme)}>
  {errorMessage}
</Alert>
```

### Buttons

```tsx
import { buttonStyles } from '../../../theme/styleUtils';

// In your component:
<Button 
  variant="contained" 
  sx={buttonStyles(theme)}
>
  Submit
</Button>
```

### Flex Layouts

```tsx
import { flexContainerStyles, centeredContentStyles } from '../../../theme/styleUtils';

// For a simple flex container:
<Box sx={flexContainerStyles}>
  {/* Flexbox items */}
</Box>

// For a centered flex container:
<Box sx={centeredContentStyles}>
  {/* Centered content */}
</Box>
```

### Typography

Use Material-UI's typography variants for consistent text styling:

```tsx
<Typography variant="h4" sx={sectionTitleStyles(theme)}>Section Title</Typography>
<Typography variant="body1">Regular text</Typography>
<Typography variant="subtitle1">Subtitle</Typography>
```

## Best Practices

1. **Always use theme values** instead of hardcoded colors, spacing, or border radius
2. **Import the utilities** from `styleUtils.ts` for common styling patterns
3. **Use the `useTheme` hook** to access the current theme
4. **Combine utility styles** with additional sx props using the spread operator:

```tsx
<Button 
  sx={{
    ...buttonStyles(theme),
    mt: 2,  // Add margin top
    width: '100%'  // Add full width
  }}
>
  Custom Button
</Button>
```

5. **Ensure dark mode compatibility** by using theme colors instead of hardcoded values

## File Structure

- `theme/theme.ts`: Main theme configuration
- `theme/styleUtils.ts`: Reusable style utilities
- `theme/ThemeProvider.tsx`: Theme provider with dark/light mode toggle

By following this guide, we maintain a consistent look and feel across the entire WorkPlus application. 