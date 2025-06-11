import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControlLabel,
  Stack,
  Button,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Paper,
  Chip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Palette,
  RestartAlt,
  Save,
  Refresh,
} from '@mui/icons-material';
import { useThemeContext } from '../../../theme/ThemeProvider';
import { ThemeColors, DEFAULT_THEME_COLORS } from '../services/userSettingsService';
import DashboardLayout from '../components/DashboardLayout';

// Predefined color palettes for easy selection
const PRESET_PALETTES: { name: string; colors: ThemeColors }[] = [
  {
    name: 'WorkPlus Default',
    colors: {
      light: {
        primary: '#ba8b34',
        secondary: '#dc004e',
        accent: '#f57c00',
        background: '#FFFFFF',
        surface: '#F4F4F1',
        text: '#212121'
      },
      dark: {
        primary: '#E6AF2F',
        secondary: '#f48fb1',
        accent: '#ffb74d',
        background: '#0a1929',
        surface: '#171b35',
        text: '#ffffff'
      }
    }
  },
  {
    name: 'Material Blue',
    colors: {
      light: {
        primary: '#1976d2',
        secondary: '#dc004e',
        accent: '#f57c00',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#212121'
      },
      dark: {
        primary: '#90caf9',
        secondary: '#f48fb1',
        accent: '#ffb74d',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff'
      }
    }
  },
  {
    name: 'Ocean',
    colors: {
      light: {
        primary: '#0277bd',
        secondary: '#00acc1',
        accent: '#ff5722',
        background: '#ffffff',
        surface: '#f0f8ff',
        text: '#263238'
      },
      dark: {
        primary: '#4fc3f7',
        secondary: '#4dd0e1',
        accent: '#ff8a65',
        background: '#0d1117',
        surface: '#161b22',
        text: '#ffffff'
      }
    }
  },
  {
    name: 'Forest',
    colors: {
      light: {
        primary: '#2e7d32',
        secondary: '#388e3c',
        accent: '#ff9800',
        background: '#ffffff',
        surface: '#f1f8e9',
        text: '#1b5e20'
      },
      dark: {
        primary: '#66bb6a',
        secondary: '#81c784',
        accent: '#ffb74d',
        background: '#0d1b0f',
        surface: '#1a2e1c',
        text: '#ffffff'
      }
    }
  },
  {
    name: 'Purple',
    colors: {
      light: {
        primary: '#7b1fa2',
        secondary: '#8e24aa',
        accent: '#ff6f00',
        background: '#ffffff',
        surface: '#fce4ec',
        text: '#4a148c'
      },
      dark: {
        primary: '#ce93d8',
        secondary: '#ba68c8',
        accent: '#ffb74d',
        background: '#1a0e1f',
        surface: '#2d1b34',
        text: '#ffffff'
      }
    }
  }
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="body2" sx={{ minWidth: 100 }}>
        {label}:
      </Typography>
      <Box
        sx={{
          width: 40,
          height: 30,
          backgroundColor: value,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        {value.toUpperCase()}
      </Typography>
    </Box>
  );
};

const Settings: React.FC = () => {
  const {
    mode,
    toggleColorMode,
    themeColors,
    useCustomColors,
    updateThemeColors,
    setUseCustomColors,
    resetToDefaults,
    isLoading,
  } = useThemeContext();

  const [localColors, setLocalColors] = useState<ThemeColors>(themeColors);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    setLocalColors(themeColors);
    // Check if current colors match any preset
    const matchingPreset = PRESET_PALETTES.find(
      preset => JSON.stringify(preset.colors) === JSON.stringify(themeColors)
    );
    setSelectedPreset(matchingPreset?.name || null);
  }, [themeColors]);

  useEffect(() => {
    // Check if there are unsaved changes
    const hasChanges = JSON.stringify(localColors) !== JSON.stringify(themeColors);
    setHasUnsavedChanges(hasChanges);
    
    // Update selected preset based on current local colors
    const matchingPreset = PRESET_PALETTES.find(
      preset => JSON.stringify(preset.colors) === JSON.stringify(localColors)
    );
    setSelectedPreset(matchingPreset?.name || 'Custom');
  }, [localColors, themeColors]);

  const handleColorChange = (mode: 'light' | 'dark', colorType: keyof ThemeColors['light'], value: string) => {
    const newColors = {
      ...localColors,
      [mode]: {
        ...localColors[mode],
        [colorType]: value,
      },
    };
    setLocalColors(newColors);
    setHasUnsavedChanges(true);
    setSelectedPreset('Custom');
    
    // Apply theme instantly
    updateThemeColors(newColors).catch(console.error);
  };

  const handlePresetSelection = async (preset: ThemeColors) => {
    setLocalColors(preset);
    setHasUnsavedChanges(false);
    
    // Auto-save and apply the preset immediately
    try {
      // Enable custom colors if not already enabled
      if (!useCustomColors) {
        await setUseCustomColors(true);
      }
      
      await updateThemeColors(preset);
      setSnackbar({
        open: true,
        message: 'Theme preset applied successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error applying theme preset',
        severity: 'error',
      });
    }
  };

  const handleSaveColors = async () => {
    try {
      await updateThemeColors(localColors);
      setHasUnsavedChanges(false);
      setSnackbar({
        open: true,
        message: 'Theme colors saved successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving theme colors',
        severity: 'error',
      });
    }
  };

  const handleResetColors = () => {
    setLocalColors(DEFAULT_THEME_COLORS);
  };

  const handleUseCustomColorsToggle = async (checked: boolean) => {
    try {
      await setUseCustomColors(checked);
      setSnackbar({
        open: true,
        message: `${checked ? 'Custom colors enabled' : 'Using default colors'}`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating custom colors setting',
        severity: 'error',
      });
    }
  };

  const handleResetToDefaults = async () => {
    try {
      await resetToDefaults();
      setSnackbar({
        open: true,
        message: 'Settings reset to defaults',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error resetting to defaults',
        severity: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading settings...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>

      <Stack spacing={3}>
        {/* Theme Settings */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {mode === 'dark' ? <Brightness4 /> : <Brightness7 />}
              <Typography variant="h6">Theme Settings</Typography>
            </Box>
            
            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Toggle between light and dark theme"
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={mode === 'dark' ? 'Dark' : 'Light'}
                      size="small"
                      color={mode === 'dark' ? 'primary' : 'default'}
                    />
                    <Switch
                      edge="end"
                      checked={mode === 'dark'}
                      onChange={toggleColorMode}
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Palette />
                      <Typography>Use Custom Colors</Typography>
                    </Box>
                  }
                  secondary="Enable custom color themes to personalize your experience"
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={useCustomColors ? 'Custom' : 'Default'}
                      size="small"
                      color={useCustomColors ? 'secondary' : 'default'}
                    />
                    <Switch
                      edge="end"
                      checked={useCustomColors}
                      onChange={(e) => handleUseCustomColorsToggle(e.target.checked)}
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Color Palette Presets */}
        {useCustomColors && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Color Presets
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose from predefined color palettes. Selected preset will be applied immediately.
                {selectedPreset && (
                  <span style={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {' '}Currently using: {selectedPreset}
                  </span>
                )}
              </Typography>
              
              <Grid container spacing={2}>
                {PRESET_PALETTES.map((preset) => (
                  <Grid item xs={6} sm={4} md={2.4} key={preset.name}>
                    <Paper
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        border: '3px solid',
                        borderColor: selectedPreset === preset.name
                          ? 'primary.main' 
                          : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'scale(1.02)',
                        },
                        ...(selectedPreset === preset.name && {
                          boxShadow: 3,
                        }),
                      }}
                      onClick={() => handlePresetSelection(preset.colors)}
                    >
                      <Typography variant="caption" textAlign="center" display="block" mb={1} fontWeight={selectedPreset === preset.name ? 'bold' : 'normal'}>
                        {preset.name}
                        {selectedPreset === preset.name && ' ✓'}
                      </Typography>
                      <Box display="flex" gap={0.5} mb={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: preset.colors.light.primary,
                            borderRadius: '50%',
                            marginRight: 0.5,
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: preset.colors.light.secondary,
                            borderRadius: '50%',
                            marginRight: 0.5,
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: preset.colors.dark.primary,
                            borderRadius: '50%',
                            marginRight: 0.5,
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: preset.colors.dark.secondary,
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Custom Color Editor */}
        {useCustomColors && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Custom Color Editor
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {selectedPreset && selectedPreset !== 'Custom' 
                  ? `Editing "${selectedPreset}" preset. Changes will create a custom theme.`
                  : 'Create your own custom color theme using the color pickers below.'
                }
              </Typography>
              
              <Grid container spacing={3}>
                {/* Light Theme Colors */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Light Theme
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <ColorPicker
                      label="Primary"
                      value={localColors.light.primary}
                      onChange={(value) => handleColorChange('light', 'primary', value)}
                    />
                    <ColorPicker
                      label="Secondary"
                      value={localColors.light.secondary}
                      onChange={(value) => handleColorChange('light', 'secondary', value)}
                    />
                    <ColorPicker
                      label="Accent"
                      value={localColors.light.accent}
                      onChange={(value) => handleColorChange('light', 'accent', value)}
                    />
                    <ColorPicker
                      label="Background"
                      value={localColors.light.background}
                      onChange={(value) => handleColorChange('light', 'background', value)}
                    />
                    <ColorPicker
                      label="Surface"
                      value={localColors.light.surface}
                      onChange={(value) => handleColorChange('light', 'surface', value)}
                    />
                    <ColorPicker
                      label="Text"
                      value={localColors.light.text}
                      onChange={(value) => handleColorChange('light', 'text', value)}
                    />
                  </Box>
                </Grid>

                {/* Dark Theme Colors */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Dark Theme
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <ColorPicker
                      label="Primary"
                      value={localColors.dark.primary}
                      onChange={(value) => handleColorChange('dark', 'primary', value)}
                    />
                    <ColorPicker
                      label="Secondary"
                      value={localColors.dark.secondary}
                      onChange={(value) => handleColorChange('dark', 'secondary', value)}
                    />
                    <ColorPicker
                      label="Accent"
                      value={localColors.dark.accent}
                      onChange={(value) => handleColorChange('dark', 'accent', value)}
                    />
                    <ColorPicker
                      label="Background"
                      value={localColors.dark.background}
                      onChange={(value) => handleColorChange('dark', 'background', value)}
                    />
                    <ColorPicker
                      label="Surface"
                      value={localColors.dark.surface}
                      onChange={(value) => handleColorChange('dark', 'surface', value)}
                    />
                    <ColorPicker
                      label="Text"
                      value={localColors.dark.text}
                      onChange={(value) => handleColorChange('dark', 'text', value)}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveColors}
                  disabled={!hasUnsavedChanges}
                >
                  Save Colors
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleResetColors}
                >
                  Reset to Defaults
                </Button>
              </Box>

              {hasUnsavedChanges && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You have unsaved changes. Click "Save Colors" to apply them.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reset to Defaults */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              Reset Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Reset all theme settings to their default values. This action cannot be undone.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RestartAlt />}
              onClick={handleResetToDefaults}
            >
              Reset All Settings
            </Button>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default Settings; 