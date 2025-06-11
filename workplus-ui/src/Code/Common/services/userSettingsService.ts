import axios from 'axios';
import { API_URL } from '../config';

// Configure axios for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication failed - token may be invalid or expired');
      // Don't automatically redirect in incognito mode, just log the error
    }
    return Promise.reject(error);
  }
);

// User Settings Types
export interface UserSetting {
  id: number;
  userId: number;
  settingKey: string;
  settingValue?: string;
  settingType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserSetting {
  settingKey: string;
  settingValue?: string;
  settingType?: string;
}

export interface ThemeColors {
  light: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  dark: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export interface UserSettingsState {
  themeMode: 'light' | 'dark';
  themeColors?: ThemeColors;
  useCustomColors?: boolean;
}

// Default theme colors (WorkPlus branding - main colors only)
export const DEFAULT_THEME_COLORS: ThemeColors = {
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
};

class UserSettingsService {
  private readonly baseUrl = `${API_URL}/user/usersettings`;

  // Helper method to check if localStorage is available and user is authenticated
  private isAuthenticated(): boolean {
    try {
      // Test localStorage accessibility
      localStorage.setItem('__test__', 'test');
      localStorage.removeItem('__test__');
      
      // Check for token
      const token = localStorage.getItem('token');
      return token !== null;
    } catch (e) {
      console.warn('localStorage not available or accessible');
      return false;
    }
  }

  // General settings methods
  async getAllSettings(): Promise<UserSetting[]> {
    try {
      console.log('Fetching all user settings...');
      const response = await axios.get(this.baseUrl);
      console.log('Settings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return [];
    }
  }

  async getSetting(settingKey: string): Promise<UserSetting | null> {
    try {
      console.log(`Fetching setting: ${settingKey}`);
      const response = await axios.get(`${this.baseUrl}/${settingKey}`);
      console.log('Setting response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching setting '${settingKey}':`, error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return null;
    }
  }

  async createOrUpdateSetting(setting: CreateUserSetting): Promise<UserSetting | null> {
    try {
      console.log('Creating/updating setting:', setting);
      const response = await axios.post(this.baseUrl, setting);
      console.log('Create/update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating setting:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return null;
    }
  }

  async updateMultipleSettings(settings: CreateUserSetting[]): Promise<UserSetting[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/bulk`, { settings });
      return response.data;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      return [];
    }
  }

  async deleteSetting(settingKey: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${settingKey}`);
      return true;
    } catch (error) {
      console.error(`Error deleting setting '${settingKey}':`, error);
      return false;
    }
  }

  // Theme-specific methods
  async getThemeMode(): Promise<'light' | 'dark'> {
    try {
      console.log('Fetching theme mode...');
      const response = await axios.get(`${this.baseUrl}/theme/mode`);
      console.log('Theme mode response:', response.data);
      return response.data === 'dark' ? 'dark' : 'light';
    } catch (error) {
      console.error('Error fetching theme mode:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return 'light'; // Default to light theme
    }
  }

  async setThemeMode(mode: 'light' | 'dark'): Promise<boolean> {
    try {
      console.log('Setting theme mode:', mode);
      const response = await axios.post(`${this.baseUrl}/theme/mode`, { mode });
      console.log('Set theme mode response:', response.data);
      return true;
    } catch (error) {
      console.error('Error setting theme mode:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return false;
    }
  }

  async getThemeColors(): Promise<ThemeColors | null> {
    try {
      console.log('Fetching theme colors...');
      const response = await axios.get(`${this.baseUrl}/theme/colors`);
      console.log('Theme colors response:', response.data);
      // If response is empty object or null, return null
      if (!response.data || Object.keys(response.data).length === 0) {
        return null;
      }
      return response.data as ThemeColors;
    } catch (error) {
      console.error('Error fetching theme colors:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return null;
    }
  }

  async setThemeColors(colors: ThemeColors): Promise<boolean> {
    try {
      console.log('Setting theme colors:', colors);
      const response = await axios.post(`${this.baseUrl}/theme/colors`, colors);
      console.log('Set theme colors response:', response.data);
      return true;
    } catch (error) {
      console.error('Error setting theme colors:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return false;
    }
  }

  async getUseCustomColors(): Promise<boolean> {
    try {
      console.log('Fetching use custom colors setting...');
      const response = await axios.get(`${this.baseUrl}/theme/use-custom-colors`);
      console.log('Use custom colors response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching use custom colors:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return false; // Default to false
    }
  }

  async setUseCustomColors(useCustomColors: boolean): Promise<boolean> {
    try {
      // Check authentication before making the request
      if (!this.isAuthenticated()) {
        console.warn('Not authenticated or localStorage unavailable - cannot save use custom colors setting');
        return false;
      }

      console.log('Setting use custom colors:', useCustomColors);
      const response = await axios.post(`${this.baseUrl}/theme/use-custom-colors`, { 
        useCustomColors 
      });
      console.log('Set use custom colors response:', response.data);
      return true;
    } catch (error) {
      console.error('Error setting use custom colors:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.warn('Authentication failed while saving use custom colors setting');
        }
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      return false;
    }
  }

  // Convenience methods for complete theme state management
  async getCompleteThemeSettings(): Promise<UserSettingsState> {
    try {
      const [themeMode, themeColors, useCustomColors] = await Promise.all([
        this.getThemeMode(),
        this.getThemeColors(),
        this.getUseCustomColors()
      ]);

      return {
        themeMode,
        themeColors: themeColors || undefined,
        useCustomColors
      };
    } catch (error) {
      console.error('Error fetching complete theme settings:', error);
      return {
        themeMode: 'light',
        useCustomColors: false
      };
    }
  }

  async saveCompleteThemeSettings(settings: UserSettingsState): Promise<boolean> {
    try {
      // Check if we can access localStorage and have a token
      if (!this.isAuthenticated()) {
        console.warn('Not authenticated or localStorage unavailable - cannot save complete theme settings');
        return false;
      }

      const promises: Promise<any>[] = [
        this.setThemeMode(settings.themeMode),
        this.setUseCustomColors(settings.useCustomColors || false)
      ];

      if (settings.useCustomColors && settings.themeColors) {
        promises.push(this.setThemeColors(settings.themeColors));
      } else {
        // Clear custom colors if not using them
        promises.push(this.deleteSetting('theme_colors'));
      }

      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error('Error saving complete theme settings:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.warn('Authentication failed while saving theme settings - user may need to login again');
        }
      }
      return false;
    }
  }

  // Helper method to reset to default settings
  async resetThemeToDefaults(): Promise<boolean> {
    try {
      await Promise.all([
        this.setThemeMode('light'),
        this.setUseCustomColors(false),
        this.deleteSetting('theme_colors')
      ]);
      return true;
    } catch (error) {
      console.error('Error resetting theme to defaults:', error);
      return false;
    }
  }

  // Helper method to get theme colors with fallback to defaults
  getThemeColorsWithFallback(customColors?: ThemeColors | null): ThemeColors {
    return customColors || DEFAULT_THEME_COLORS;
  }
}

// Export singleton instance
export const userSettingsService = new UserSettingsService();
export default userSettingsService; 