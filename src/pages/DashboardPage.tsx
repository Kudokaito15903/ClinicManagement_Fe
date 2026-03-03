import { useEffect, useState } from 'react';
import {
    Grid, Card, CardContent, Typography, Box, Skeleton,
    Avatar, Divider, alpha,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import dayjs from 'dayjs';
import { getStatistics } from '@/api/reports';
import { getRevenueReport } from '@/api/reports';
import type { Statistics, RevenueReport } from '@/types';
import RevenueChart from '@/components/RevenueChart';

interface StatCard {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

const fmtMoney = (n?: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export default function DashboardPage() {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [revenue, setRevenue] = useState<RevenueReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const from = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
        const to = dayjs().format('YYYY-MM-DD');

        Promise.all([getStatistics(), getRevenueReport(from, to)])
            .then(([s, r]) => { setStats(s); setRevenue(r); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const cards: StatCard[] = stats
        ? [
            {
                label: 'Tổng bệnh nhân',
                value: stats.totalPatients,
                icon: <PeopleIcon />,
                color: '#2563eb',
                subtitle: 'Đã đăng ký',
            },
            {
                label: 'Lần khám hôm nay',
                value: stats.totalVisitsToday,
                icon: <EventNoteIcon />,
                color: '#10b981',
                subtitle: dayjs().format('DD/MM/YYYY'),
            },
            {
                label: 'Doanh thu tháng',
                value: fmtMoney(stats.totalRevenueMonth),
                icon: <AttachMoneyIcon />,
                color: '#f59e0b',
                subtitle: dayjs().format('MM/YYYY'),
            },
            {
                label: 'Số bác sĩ',
                value: stats.totalDoctors,
                icon: <LocalHospitalIcon />,
                color: '#7c3aed',
                subtitle: 'Đang làm việc',
            },
        ]
        : [];

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Dashboard
                </Typography>
                <Typography color="text.secondary">
                    Tổng quan hệ thống phòng khám — {dayjs().format('dddd, DD/MM/YYYY')}
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {loading
                    ? [1, 2, 3, 4].map((k) => (
                        <Grid item xs={12} sm={6} lg={3} key={k}>
                            <Card><CardContent><Skeleton height={80} /></CardContent></Card>
                        </Grid>
                    ))
                    : cards.map((c) => (
                        <Grid item xs={12} sm={6} lg={3} key={c.label}>
                            <Card
                                sx={{
                                    background: `linear-gradient(135deg, ${alpha(c.color, 0.08)} 0%, ${alpha(c.color, 0.04)} 100%)`,
                                    border: `1px solid ${alpha(c.color, 0.15)}`,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(c.color, 0.2)}` },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                                {c.label}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={700} sx={{ color: c.color, mt: 0.5 }}>
                                                {c.value}
                                            </Typography>
                                            {c.subtitle && (
                                                <Typography variant="caption" color="text.secondary">{c.subtitle}</Typography>
                                            )}
                                        </Box>
                                        <Avatar sx={{ bgcolor: alpha(c.color, 0.15), color: c.color, width: 48, height: 48 }}>
                                            {c.icon}
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
            </Grid>

            {/* Revenue Chart */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>Doanh thu 30 ngày gần đây</Typography>
                        <Typography variant="caption" color="text.secondary">Biểu đồ doanh thu theo ngày</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    {loading ? (
                        <Skeleton height={300} variant="rectangular" sx={{ borderRadius: 2 }} />
                    ) : revenue.length > 0 ? (
                        <RevenueChart data={revenue} height={320} />
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            <Typography>Chưa có dữ liệu doanh thu</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
