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

const fmt = (n?: number | null) => (n ?? 0).toLocaleString('vi-VN') + ' ₫';

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
    }, [id, enqueueSnackbar]);

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
                                {patient.birthYear && <Chip label={`Năm ${patient.birthYear} `} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small" />}
                            </Box>
                            {patient.address && <Typography sx={{ mt: 1, opacity: 0.85 }} variant="body2">📍 {patient.address}</Typography>}
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
                                    <TableCell>#</TableCell>
                                    <TableCell>Ngày khám</TableCell>
                                    <TableCell>Bác sĩ</TableCell>
                                    <TableCell>Phòng</TableCell>
                                    <TableCell>Phí khám</TableCell>
                                    <TableCell>Ghi chú</TableCell>
                                    <TableCell align="right">Chi tiết</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visits.map((v) => (
                                    <TableRow key={v.id} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell>{v.id}</TableCell>
                                        <TableCell>{dayjs(v.visitDate).format('DD/MM/YYYY HH:mm')}</TableCell>
                                        <TableCell>{(v.doctor as any)?.name ?? '—'}</TableCell>
                                        <TableCell>{(v.room as any)?.name ?? '—'}</TableCell>
                                        <TableCell>{fmt((v as any).total)}</TableCell>
                                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {v.notes ?? '—'}
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
