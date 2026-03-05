import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Chip, Avatar,
    CircularProgress, Button, Divider, Table, TableBody,
    TableCell, TableHead, TableRow, Breadcrumbs, Link, alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useSnackbar } from 'notistack';
import { getPatient, getPatientVisits } from '@/api/patients';
import type { Patient, Visit } from '@/types';
import dayjs from 'dayjs';

const statusLabel = (s?: string) => {
    if (s === 'received') return 'Đã tiếp nhận';
    if (s === 'examining') return 'Đang khám';
    if (s === 'done') return 'Hoàn thành';
    return s ?? '—';
};
const statusColor = (s?: string): 'warning' | 'info' | 'success' | 'default' => {
    if (s === 'received') return 'warning';
    if (s === 'examining') return 'info';
    if (s === 'done') return 'success';
    return 'default';
};

export default function PatientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getPatient(Number(id)), getPatientVisits(Number(id))])
            .then(([p, v]) => { setPatient(p); setVisits(v); })
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (!patient) return <Typography>Không tìm thấy bệnh nhân.</Typography>;

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/patients')}>
                    Bệnh nhân
                </Link>
                <Typography color="text.primary">{patient.fullName}</Typography>
            </Breadcrumbs>

            {/* Header Card */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: 'white' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '2rem' }}>
                            {patient.fullName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" fontWeight={700}>{patient.fullName}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                <Chip label={patient.code} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small" />
                                {patient.gender && <Chip label={patient.gender === 'Male' ? 'Nam' : patient.gender === 'Female' ? 'Nữ' : 'Khác'} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small" />}
                                {patient.dateOfBirth && <Chip label={`Sinh ${dayjs(patient.dateOfBirth).format('DD/MM/YYYY')}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small" />}
                            </Box>
                            {patient.phone && <Typography sx={{ mt: 0.5, opacity: 0.85 }} variant="body2">📞 {patient.phone}</Typography>}
                            {patient.address && <Typography sx={{ mt: 0.5, opacity: 0.85 }} variant="body2">📍 {patient.address}</Typography>}
                            {patient.note && <Typography sx={{ mt: 0.5, opacity: 0.75 }} variant="body2">📝 {patient.note}</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white' } }}
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/patients/${id}/edit`)}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                startIcon={<AddIcon />}
                                onClick={() => navigate(`/visits/new?patientId=${id}`)}
                            >
                                Tạo lần khám
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Visit History */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EventNoteIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>Lịch sử khám ({visits.length} lần)</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {visits.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                            <EventNoteIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            <Typography sx={{ mt: 1 }}>Chưa có lần khám nào</Typography>
                        </Box>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã lần khám</TableCell>
                                    <TableCell>Ngày khám</TableCell>
                                    <TableCell>Bác sĩ</TableCell>
                                    <TableCell>Phòng</TableCell>
                                    <TableCell>Lý do</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell align="right">Chi tiết</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visits.map((v) => (
                                    <TableRow key={v.id} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell>{v.code ?? `#${v.id}`}</TableCell>
                                        <TableCell>{dayjs(v.visitDate).format('DD/MM/YYYY HH:mm')}</TableCell>
                                        <TableCell>{v.doctor?.name ?? '—'}</TableCell>
                                        <TableCell>{v.room?.name ?? '—'}</TableCell>
                                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {v.reason ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={statusLabel(v.status)}
                                                size="small"
                                                color={statusColor(v.status)}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button size="small" variant="outlined" onClick={() => navigate(`/visits/${v.id}`)}>
                                                Xem
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
