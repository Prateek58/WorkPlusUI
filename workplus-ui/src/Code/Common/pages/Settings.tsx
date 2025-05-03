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
} from '@mui/material';
import { useThemeContext } from '../../../theme/ThemeProvider';
import DashboardLayout from '../components/DashboardLayout';

const Settings = () => {
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <DashboardLayout>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>

      <Stack spacing={3}>
        {/* Theme Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Theme Settings
            </Typography>
            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Toggle between light and dark theme"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={mode === 'dark'}
                    onChange={toggleColorMode}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Notification Settings
            </Typography>
            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive email notifications"
                />
                <ListItemSecondaryAction>
                  <Switch edge="end" defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Push Notifications"
                  secondary="Receive push notifications"
                />
                <ListItemSecondaryAction>
                  <Switch edge="end" defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Privacy Settings
            </Typography>
            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary="Profile Visibility"
                  secondary="Make your profile visible to others"
                />
                <ListItemSecondaryAction>
                  <Switch edge="end" defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Activity Status"
                  secondary="Show when you're active"
                />
                <ListItemSecondaryAction>
                  <Switch edge="end" defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default Settings; 