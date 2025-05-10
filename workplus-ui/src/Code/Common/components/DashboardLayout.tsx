import { useState, ReactNode } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
  Collapse,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  ShoppingCart as ShoppingCartIcon,
  School as SchoolIcon,
  LocalShipping as LogisticsIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Description as DescriptionIcon,
  LocalShipping as TruckIcon,
  Engineering as JobWorkIcon,
  LightMode,
  DarkMode,
  Help as HelpIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../../../theme/ThemeProvider';
import logoTransparent from '../../../assets/logo-trans.png';
import logo from '../../../assets/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../../store/store';

const drawerWidth = 240;
const collapsedWidth = 64;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.paper,
    width: drawerWidth,
    border: 'none',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
}));

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>('legacy-reports');
  const theme = useTheme();
  const { toggleColorMode, mode } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleSubMenuClick = (menuId: string) => {
    setOpenSubMenu(openSubMenu === menuId ? null : menuId);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleProfileMenuClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { text: 'Dashboards', icon: <DashboardIcon />, count: 5, path: '/dashboard' },
    { 
      text: 'Legacy Reports', 
      icon: <DescriptionIcon />,
      id: 'legacy-reports',
      subItems: [
        { text: 'Lorry Receipt', icon: <TruckIcon />, path: '/lorry-receipt' },
        { text: 'Job Works', icon: <JobWorkIcon />, path: '/job-work' },
      ]
    },
    { 
      text: 'WorkPlus', 
      icon: <AnalyticsIcon />,
      id: 'workplus',
      subItems: [
        { text: 'Work Entry', icon: <JobWorkIcon />, path: '/work-entry' },
      ]
    },
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: '64px',
        }}
      >
        <Box 
          sx={{ 
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s',
            display: open ? 'block' : 'none',
            width: '160px',
          }}
        >
          <img
            src={mode === 'dark' ? logo : logoTransparent}
            alt="Logo"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '4px',
            }}
          />
        </Box>
        <IconButton 
          onClick={toggleDrawer}
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            }
          }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            <ListItem
              component="div"
              onClick={() => {
                if (item.subItems) {
                  handleSubMenuClick(item.id);
                } else if (item.path) {
                  handleNavigate(item.path);
                }
              }}
              sx={{
                borderRadius: 2,
                mb: item.subItems ? 0 : 1,
                cursor: 'pointer',
                backgroundColor: item.path && isActive(item.path) ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                    color: 'white',
                  },
                },
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                  color: item.path && isActive(item.path) ? 'white' : 'inherit',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: open ? 1 : 0,
                  transition: 'opacity 0.2s',
                }} 
              />
              {item.count && open && (
                <Box
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    borderRadius: 1,
                    px: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {item.count}
                </Box>
              )}
              {item.subItems && open && (
                <IconButton
                  size="small" 
                  sx={{ 
                    ml: 'auto',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.25rem',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubMenuClick(item.id);
                  }}
                >
                  {openSubMenu === item.id ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </IconButton>
              )}
            </ListItem>
            {item.subItems && (
              <Collapse in={openSubMenu === item.id && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem
                      key={subItem.text}
                      component="div"
                      onClick={() => subItem.path && handleNavigate(subItem.path)}
                      sx={{
                        pl: 6,
                        borderRadius: 2,
                        mb: 1,
                        cursor: 'pointer',
                        backgroundColor: subItem.path && isActive(subItem.path) ? 'primary.main' : 'transparent',
                        borderLeft: `2px solid ${theme.palette.mode === 'light' 
                          ? 'rgba(0, 0, 0, 0.08)' 
                          : 'rgba(255, 255, 255, 0.08)'}`,
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          borderLeftColor: 'primary.main',
                          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                            color: 'white',
                          },
                        },
                        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                          color: subItem.path && isActive(subItem.path) ? 'white' : 'inherit',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>{subItem.icon}</ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        sx={{
                          opacity: open ? 1 : 0,
                          transition: 'opacity 0.2s',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
          boxShadow: 'none',
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)` },
          ml: { sm: `${open ? drawerWidth : collapsedWidth}px` },
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? '#0A1929' : 'background.paper',
            minHeight: '64px !important',
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{  flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ position: 'absolute', left: 8, color: 'text.secondary' }} />
              <input
                placeholder="Search (Ctrl+/)"
                style={{
                  border: 'none',
                  padding: '8px 8px 8px 36px',
                  backgroundColor: theme.palette.mode === 'light' ? '#F4F5FA' : '#182536',
                  color: theme.palette.text.primary,
                  width: '250px',
                }}
              />
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton 
                onClick={toggleColorMode} 
                sx={{ 
                  color: mode === 'dark' ? 'inherit' : 'text.primary'
                }}
              >
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
            <IconButton>
              <NotificationsIcon />
            </IconButton>
            <Avatar 
              onClick={handleProfileMenuOpen}
              sx={{ 
                bgcolor: 'primary.main',
                cursor: 'pointer'
              }}
            >
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 220,
            py: 0.5,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.username || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleNavigate('/profile')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/help')}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          Help
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box 
        component="nav" 
        sx={{ 
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open={open}
        >
          {drawer}
        </StyledDrawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)` },
          mt: 7,
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 