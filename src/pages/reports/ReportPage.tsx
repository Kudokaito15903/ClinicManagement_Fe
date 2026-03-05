import { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, Divider,
    CircularProgress, Alert, alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import dayjs from 'dayjs';
import { getRevenueReport } from '@/api/reports';
import type { RevenueReportResponse, DailyRevenue } from '@/types';
import RevenueChart from '@/components/RevenueChart';

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function ReportPage() {
    const [from, setFrom] = useState(dayjs().subtract(29, 'day').format('YYYY-MM-DD'));
    const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
    const [report, setReport] = useState<RevenueReportResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getRevenueReport(from, to);
            setReport(res);
            setSearched(true);
        } catch {
            setError('Không thể tải báo cáo. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const daily: DailyRevenue[] = report?.daily ?? [];

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Báo cáo doanh thu</Typography>
                <Typography color="text.secondary" variant="body2">Thống kê doanh thu theo khoảng thời gian</Typography>
            </Box>

            {/* Filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Từ ngày"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Đến ngày"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                                onClick={handleSearch}
                                disabled={loading}
                                fullWidth
                                sx={{ py: 1, borderRadius: '10px' }}
                            >
                                {loading ? 'Đang tải...' : 'Xem báo cáo'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {searched && report && (
                <>
                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {[
                            { label: 'Tổng doanh thu', value: fmt(report.grandTotal), color: '#2563eb' },
                            { label: 'Tổng lần khám', value: report.totalVisits, color: '#10b981' },
                            { label: 'Doanh thu TB/ngày', value: fmt(Math.round(daily.length > 0 ? report.grandTotal / daily.length : 0)), color: '#f59e0b' },
                        ].map((c) => (
                            <Grid item xs={12} sm={4} key={c.label}>
                                <Card sx={{ border: `1px solid ${alpha(c.color, 0.2)}`, background: alpha(c.color, 0.05) }}>
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                                            {c.label}
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: c.color, mt: 0.5 }}>
                                            {c.value}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Chart + Table */}
                    {daily.length > 0 ? (
                        <>
                            <Card sx={{ mb: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <BarChartIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>Biểu đồ doanh thu</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    <RevenueChart data={daily} height={320} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent sx={{ p: 0 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Ngày</TableCell>
                                                <TableCell align="right">Số lần khám</TableCell>
                                                <TableCell align="right">Phí khám</TableCell>
                                                <TableCell align="right">Dịch vụ</TableCell>
                                                <TableCell align="right">Tổng cộng</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {daily.map((d) => (
                                                <TableRow key={d.date} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                                    <TableCell>{dayjs(d.date).format('DD/MM/YYYY')}</TableCell>
                                                    <TableCell align="right">{d.visitCount}</TableCell>
                                                    <TableCell align="right">{fmt(d.examinationRevenue ?? 0)}</TableCell>
                                                    <TableCell align="right">{fmt(d.serviceRevenue ?? 0)}</TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight={600} color="primary.main">{fmt(d.total)}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                                <BarChartIcon sx={{ fontSize: 64, opacity: 0.2 }} />
                                <Typography sx={{ mt: 2 }}>Không có dữ liệu trong khoảng thời gian này</Typography>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </Box>
    );
}
