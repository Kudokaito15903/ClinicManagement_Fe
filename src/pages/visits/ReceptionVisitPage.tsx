import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton,
    Tooltip, MenuItem, alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PrintIcon from '@mui/icons-material/Print';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { getVisits, getVisitReceiptUrl } from '@/api/visits';
import { getDoctors } from '@/api/doctors';
import { getRooms } from '@/api/rooms';
import type { Visit, Doctor, Room } from '@/types';

dayjs.locale('vi');

// API trả về status dạng PascalCase
const STATUS_DEFS = [
    { key: 'Received', label: 'Tiếp nhận', emoji: '🔵', color: '#1D4ED8', bg: '#EFF6FF' },
    { key: 'Examining', label: 'Đang khám', emoji: '🟡', color: '#92400E', bg: '#FEFCE8' },
    { key: 'WaitingResult', label: 'Chờ KQ', emoji: '🟠', color: '#C2410C', bg: '#FFF7ED' },
    { key: 'Completed', label: 'Hoàn thành', emoji: '🟢', color: '#15803D', bg: '#F0FDF4' },
    { key: 'Paid', label: 'Đã TT', emoji: '✅', color: '#64748B', bg: '#F8FAFC' },
] as const;

function statusDef(s?: string) {
    return STATUS_DEFS.find((d) => d.key === s) ?? { label: s ?? '—', emoji: '❓', color: '#64748b', bg: '#f1f5f9' };
}

export default function ReceptionVisitPage() {
    const navigate = useNavigate();
    const refreshRef = useRef<ReturnType<typeof setInterval>>();

    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [statusFilter, setStatusFilter] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [visits, setVisits] = useState<Visit[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);

    // Count visits by status for summary cards
    const counts = STATUS_DEFS.reduce((acc, s) => {
        acc[s.key] = visits.filter((v) => v.status === s.key).length;
        return acc;
    }, {} as Record<string, number>);

    const fetchVisits = useCallback(() => {
        setLoading(true);
        getVisits({
            date,
            status: statusFilter || undefined,
            doctorId: doctorId ? Number(doctorId) : undefined,
            roomId: roomId ? Number(roomId) : undefined,
        })
            .then(setVisits)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [date, statusFilter, doctorId, roomId]);

    useEffect(() => { fetchVisits(); }, [fetchVisits]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        refreshRef.current = setInterval(fetchVisits, 30_000);
        return () => clearInterval(refreshRef.current);
    }, [fetchVisits]);

    useEffect(() => {
        getDoctors().then(setDoctors).catch(() => { });
        getRooms().then(setRooms).catch(() => { });
    }, []);

    return (
        <Box>
            {/* ── Header ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Quầy Lễ Tân</Typography>
                    <Typography color="text.secondary" variant="body2">
                        {dayjs(date).format('dddd, DD/MM/YYYY')}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/visits/new')}
                    sx={{ borderRadius: '10px', px: 3 }}>
                    Tiếp nhận bệnh nhân
                </Button>
            </Box>

            {/* ── Filter Bar ── */}
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                        {/* Date picker */}
                        <Grid item>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => setDate(dayjs(date).subtract(1, 'day').format('YYYY-MM-DD'))}>
                                    <ChevronLeftIcon />
                                </IconButton>
                                <TextField
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    size="small"
                                    sx={{ width: 155 }}
                                />
                                <IconButton size="small" onClick={() => setDate(dayjs(date).add(1, 'day').format('YYYY-MM-DD'))}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </Box>
                        </Grid>

                        {/* Doctor dropdown */}
                        <Grid item xs={12} sm="auto">
                            <TextField select label="Bác sĩ" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
                                size="small" sx={{ minWidth: 180 }}>
                                <MenuItem value="">Tất cả bác sĩ</MenuItem>
                                {doctors.map((d) => <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>)}
                            </TextField>
                        </Grid>

                        {/* Room dropdown */}
                        <Grid item xs={12} sm="auto">
                            <TextField select label="Phòng" value={roomId} onChange={(e) => setRoomId(e.target.value)}
                                size="small" sx={{ minWidth: 160 }}>
                                <MenuItem value="">Tất cả phòng</MenuItem>
                                {rooms.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* Status filter buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {[{ key: '', label: 'Tất cả', emoji: '📋', color: '#2563eb' }, ...STATUS_DEFS].map((s) => {
                            const active = statusFilter === s.key;
                            return (
                                <Button
                                    key={s.key}
                                    size="small"
                                    variant={active ? 'contained' : 'outlined'}
                                    onClick={() => setStatusFilter(s.key)}
                                    sx={{
                                        borderRadius: '20px', fontSize: '0.75rem', py: 0.5, px: 1.5,
                                        ...(active
                                            ? { bgcolor: s.color, borderColor: s.color, '&:hover': { bgcolor: s.color } }
                                            : { color: s.color, borderColor: alpha(s.color, 0.4), '&:hover': { bgcolor: alpha(s.color, 0.06) } }),
                                    }}
                                >
                                    {s.emoji} {s.label}
                                </Button>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>

            {/* ── Summary Cards ── */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {STATUS_DEFS.map((s) => (
                    <Grid item xs key={s.key} sx={{ minWidth: 110 }}>
                        <Card
                            onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
                            sx={{
                                cursor: 'pointer', textAlign: 'center', p: 1.5,
                                bgcolor: statusFilter === s.key ? s.bg : 'background.paper',
                                border: `1px solid ${statusFilter === s.key ? s.color : alpha(s.color, 0.2)}`,
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: s.bg, transform: 'translateY(-2px)' },
                            }}
                        >
                            <Typography variant="h5">{s.emoji}</Typography>
                            <Typography variant="caption" fontWeight={600} sx={{ color: s.color, display: 'block', lineHeight: 1.2 }}>
                                {s.label}
                            </Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>
                                {counts[s.key] ?? 0}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* ── Table ── */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width={50}>#</TableCell>
                                <TableCell>Mã Visit</TableCell>
                                <TableCell>Bệnh nhân</TableCell>
                                <TableCell>Bác sĩ</TableCell>
                                <TableCell>Phòng</TableCell>
                                <TableCell>Giờ</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : visits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">Không có lượt khám nào</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : visits.map((v, idx) => {
                                const sd = statusDef(v.status);
                                const patientName = v.patientName ?? v.patient?.fullName ?? '—';
                                const doctorName = v.doctorName ?? v.doctor?.name ?? '—';
                                const roomName = v.roomName ?? v.room?.name ?? '—';

                                return (
                                    <TableRow
                                        key={v.id}
                                        hover
                                        sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}
                                    >
                                        <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                                                {v.code ?? `#${v.id}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={500}>{patientName}</Typography>
                                        </TableCell>
                                        <TableCell>{doctorName}</TableCell>
                                        <TableCell>{roomName}</TableCell>
                                        <TableCell>{dayjs(v.visitDate).format('HH:mm')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${sd.emoji} ${sd.label}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: sd.bg,
                                                    color: sd.color,
                                                    fontWeight: 600,
                                                    border: `1px solid ${alpha(sd.color, 0.3)}`,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton size="small" onClick={() => navigate(`/visits/${v.id}?from=reception`)}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {v.status === 'Completed' && (
                                                    <Tooltip title="Thu tiền">
                                                        <IconButton size="small" color="success"
                                                            onClick={() => navigate(`/visits/${v.id}/payment`)}>
                                                            <AttachMoneyIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {v.status === 'Paid' && (
                                                    <Tooltip title="In phiếu">
                                                        <IconButton size="small"
                                                            onClick={() => window.open(getVisitReceiptUrl(v.id), '_blank')}>
                                                            <PrintIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}
