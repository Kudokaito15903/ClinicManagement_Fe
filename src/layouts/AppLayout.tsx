import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
    Chip, Divider, useTheme, useMediaQuery, Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DiagnosisIcon from '@mui/icons-material/Biotech';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuIcon from '@mui/icons-material/Menu';
import HealingIcon from '@mui/icons-material/Healing';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

const DRAWER_WIDTH = 260;

const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Bệnh nhân', icon: <PeopleIcon />, path: '/patients' },
    { label: 'Lần khám', icon: <EventNoteIcon />, path: '/visits' },
    { label: 'Bác sĩ', icon: <LocalHospitalIcon />, path: '/doctors' },
    { label: 'Phòng khám', icon: <MeetingRoomIcon />, path: '/rooms' },
    { label: 'Chẩn đoán', icon: <DiagnosisIcon />, path: '/diagnoses' },
    { label: 'Dịch vụ y tế', icon: <MedicalServicesIcon />, path: '/services' },
    { label: 'Kho thuốc', icon: <LocalPharmacyIcon />, path: '/medicines' },
    { label: 'Báo cáo', icon: <BarChartIcon />, path: '/reports' },
    { label: 'Cấu hình', icon: <SettingsIcon />, path: '/system-configs' },
];

export default function AppLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        if (path === '/visits/new') return location.pathname.startsWith('/visits');
        return location.pathname.startsWith(path);
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <Box sx={{
                p: 3,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: 'white',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <HealingIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                            Clinic
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                            Management System
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 1.5, py: 2 }}>
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                                sx={{
                                    borderRadius: '10px',
                                    py: 1.2,
                                    px: 2,
                                    transition: 'all 0.2s',
                                    bgcolor: active ? 'primary.main' : 'transparent',
                                    color: active ? 'white' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: active ? 'primary.dark' : 'action.hover',
                                        transform: 'translateX(3px)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 36,
                                    color: active ? 'white' : 'text.secondary',
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />

            {/* User info */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                    AD
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>Admin</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>Quản trị viên</Typography>
                </Box>
                <Chip label="Online" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.08)' },
                        }}
                    >
                        {drawerContent}
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': {
                                width: DRAWER_WIDTH,
                                border: 'none',
                                boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
                            },
                        }}
                        open
                    >
                        {drawerContent}
                    </Drawer>
                )}
            </Box>

            {/* Main content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top AppBar (mobile only) */}
                {isMobile && (
                    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Toolbar>
                            <Tooltip title="Menu">
                                <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                                    <MenuIcon />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="h6" fontWeight={700} color="primary">
                                Clinic Management
                            </Typography>
                        </Toolbar>
                    </AppBar>
                )}

                {/* Page content */}
                <Box
                    component="main"
                    sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto', background: 'background.default' }}
                    className="page-fade-in"
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
