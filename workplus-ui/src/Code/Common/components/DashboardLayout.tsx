import { useState, ReactNode, useEffect } from 'react';
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
  Chip,
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
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
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
  const [openSubMenu, setOpenSubMenu] = useState<string[]>(['legacy-reports', 'workplus', 'hr']);
  const theme = useTheme();
  const { toggleColorMode, mode } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    if (window.innerWidth < 600) {
      setMobileOpen(!mobileOpen);
      if (!mobileOpen) {
        setOpen(true);
      }
    }
  };

  const toggleDrawer = () => {
    if (window.innerWidth < 600) {
      setMobileOpen(false);
    }
    setOpen(!open);
  };

  const handleSubMenuClick = (menuId: string) => {
    setOpenSubMenu(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
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
    if (window.innerWidth < 600) {
      setMobileOpen(false);
    }
    handleProfileMenuClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { text: 'Dashboards', icon: <DashboardIcon />, count: 5, path: '/dashboard' },
    { 
      text: 'WorkPlus', 
      icon: <AnalyticsIcon />,
      id: 'workplus',
      subItems: [
        { text: 'Work Entry', icon: <JobWorkIcon />, path: '/work-entry' },
        { text: 'LR Management', icon: <LogisticsIcon />, path: '/lr' },
        { text: 'Masters', icon: <SettingsIcon />, path: '/masters' },
        { text: 'Reports', icon: <DescriptionIcon />, path: '/reports' },
      ]
    },
    { 
      text: 'HR Management', 
      icon: <PeopleIcon />,
      id: 'hr',
      subItems: [
        { text: 'Attendance', icon: <CalendarTodayIcon />, path: '/hr/attendance' },
        { text: 'Leave Management', icon: <CalendarTodayIcon />, path: '/hr/leave' },
        { text: 'HR Masters', icon: <SettingsIcon />, path: '/hr/masters' },
        { text: 'Reports', icon: <DescriptionIcon />, path: '/hr/reports' },
      ]
    },
    { 
      text: 'Legacy Reports', 
      icon: <DescriptionIcon />,
      id: 'legacy-reports',
      subItems: [
        { text: 'Lorry Receipt', icon: <TruckIcon />, path: '/lorry-receipt' },
        { text: 'Job Works', icon: <JobWorkIcon />, path: '/job-work' },
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
                  {openSubMenu.includes(item.id) ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </IconButton>
              )}
            </ListItem>
            {item.subItems && (
              <Collapse in={openSubMenu.includes(item.id)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem
                      key={subItem.text}
                      onClick={() => handleNavigate(subItem.path)}
                      sx={{
                        pl: 5.5,
                        pr: 2,
                        py: 0.5,
                        borderRadius: 2,
                        mb: 0.5,
                        cursor: 'pointer',
                        backgroundColor: isActive(subItem.path) ? 'primary.main' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                            color: 'white',
                          },
                        },
                        '& .MuiListItemIcon-root': {
                          color: isActive(subItem.path) 
                            ? 'white' 
                            : theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.7)' 
                              : 'rgba(0, 0, 0, 0.6)',
                          minWidth: 32,
                        },
                        '& .MuiListItemText-primary': {
                          color: isActive(subItem.path) 
                            ? 'white' 
                            : theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : 'rgba(0, 0, 0, 0.7)',
                          fontSize: '0.8rem',
                          fontWeight: 400,
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 32,
                          '& .MuiSvgIcon-root': {
                            fontSize: '1rem',
                          }
                        }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{
                          variant: 'caption',
                          sx: {
                            fontSize: '0.8rem',
                            fontWeight: 400,
                            lineHeight: 1.2,
                          }
                        }}
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 600) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)` },
          ml: { sm: `${open ? drawerWidth : collapsedWidth}px` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          bgcolor: 'primary.main',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '& .MuiSvgIcon-root': {
                color: 'white',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
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

      <Box 
        component="nav" 
        sx={{ 
          width: { sm: open ? drawerWidth : collapsedWidth },
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
              boxSizing: 'border-box',
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
              boxSizing: 'border-box',
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
          p: { xs: 1, sm: 2 },
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)` },
          mt: 7,
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflow: 'auto',
          maxWidth: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 