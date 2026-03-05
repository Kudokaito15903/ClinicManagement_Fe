import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    List, ListItemButton, ListItemText, ListItemIcon, Radio,
    CircularProgress, Divider, Chip, InputAdornment, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { createVisit } from '@/api/visits';
import { getPatients, createPatient } from '@/api/patients';
import { getDoctors } from '@/api/doctors';
import { getRooms } from '@/api/rooms';
import type { Patient, Doctor, Room } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/** Debounce hook */
function useDebounce<T>(value: T, delay: number): T {
    const [dv, setDv] = useState(value);
    useEffect(() => {
        const h = setTimeout(() => setDv(value), delay);
        return () => clearTimeout(h);
    }, [value, delay]);
    return dv;
}

const patientSchema = z.object({
    fullName: z.string().min(2, 'Tối thiểu 2 ký tự'),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});
type PatientForm = z.infer<typeof patientSchema>;

export default function VisitFormPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();

    // Step 1 — Patient search
    const [keyword, setKeyword] = useState('');
    const debouncedKw = useDebounce(keyword, 300);
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [searching, setSearching] = useState(false);

    // Step 2 — Selected patient
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Step 3 — Visit info
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // New patient modal
    const [modalOpen, setModalOpen] = useState(false);
    const [creatingSaving, setCreatingSaving] = useState(false);
    const { control: pc, handleSubmit: phs, reset: preset, formState: { errors: pe } } = useForm<PatientForm>({
        resolver: zodResolver(patientSchema),
        defaultValues: { fullName: '', gender: undefined, phone: '', address: '' },
    });

    useEffect(() => {
        getDoctors().then(setDoctors).catch(() => { });
        getRooms().then(setRooms).catch(() => { });
        // If navigated from patient detail page with ?patientId=
        const pid = searchParams.get('patientId');
        if (pid) {
            getPatients('').then((list) => {
                const p = list.find((x) => x.id === Number(pid));
                if (p) setSelectedPatient(p);
            }).catch(() => { });
        }
    }, [searchParams]);

    // Realtime search
    useEffect(() => {
        if (!debouncedKw.trim()) { setSearchResults([]); return; }
        setSearching(true);
        getPatients(debouncedKw)
            .then(setSearchResults)
            .catch(() => { })
            .finally(() => setSearching(false));
    }, [debouncedKw]);

    const handleSelectPatient = (p: Patient) => {
        setSelectedPatient(p);
        setKeyword('');
        setSearchResults([]);
    };

    const handleCreatePatient = async (data: PatientForm) => {
        setCreatingSaving(true);
        try {
            const newP = await createPatient(data);
            setSelectedPatient(newP);
            setModalOpen(false);
            preset();
            enqueueSnackbar('Tạo bệnh nhân thành công', { variant: 'success' });
        } catch {
            enqueueSnackbar('Tạo thất bại', { variant: 'error' });
        } finally {
            setCreatingSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPatient) return;
        setSubmitting(true);
        try {
            const v = await createVisit({
                patientId: selectedPatient.id,
                doctorId: selectedDoctor ? Number(selectedDoctor) : undefined,
                roomId: selectedRoom ? Number(selectedRoom) : undefined,
                reason: reason || undefined,
            });
            enqueueSnackbar('Tạo lượt khám thành công', { variant: 'success' });
            navigate(`/visits/${v.id}`);
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const age = selectedPatient?.dateOfBirth
        ? dayjs().diff(dayjs(selectedPatient.dateOfBirth), 'year')
        : null;

    return (
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate('/visits')}>
                    Quay lại
                </Button>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Tiếp nhận bệnh nhân</Typography>
                    <Typography color="text.secondary" variant="body2">
                        {dayjs().format('dddd, DD/MM/YYYY')}
                    </Typography>
                </Box>
            </Box>

            {/* STEP 1 — Search patient */}
            <Card sx={{ mb: 2, border: selectedPatient ? '1px solid #e2e8f0' : '1px solid #2563eb' }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Chip label="1" size="small" color={selectedPatient ? 'default' : 'primary'} />
                        <Typography variant="h6" fontWeight={600}>
                            🔍 Tìm bệnh nhân
                        </Typography>
                    </Box>

                    {!selectedPatient && (
                        <>
                            <TextField
                                fullWidth
                                placeholder="Tìm theo tên, SĐT hoặc mã bệnh nhân..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {searching ? <CircularProgress size={16} /> : <SearchIcon sx={{ fontSize: 18 }} />}
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 1 }}
                            />

                            {searchResults.length > 0 && (
                                <Card variant="outlined" sx={{ maxHeight: 240, overflow: 'auto' }}>
                                    <List dense disablePadding>
                                        {searchResults.map((p) => (
                                            <ListItemButton key={p.id} onClick={() => handleSelectPatient(p)}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <Radio size="small" checked={false} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={<><strong>{p.code}</strong> — {p.fullName}</>}
                                                    secondary={[
                                                        p.dateOfBirth ? dayjs(p.dateOfBirth).format('YYYY') : null,
                                                        p.phone,
                                                    ].filter(Boolean).join(' — ')}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Card>
                            )}

                            {keyword && !searching && searchResults.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Không tìm thấy bệnh nhân phù hợp.
                                </Typography>
                            )}

                            <Box sx={{ mt: 1.5 }}>
                                <Typography variant="body2" color="text.secondary" component="span">
                                    Không tìm thấy?{' '}
                                </Typography>
                                <Button size="small" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
                                    Tạo bệnh nhân mới
                                </Button>
                            </Box>
                        </>
                    )}

                    {selectedPatient && (
                        <Alert
                            icon={<CheckCircleIcon />}
                            severity="success"
                            action={
                                <Button size="small" color="inherit" onClick={() => setSelectedPatient(null)}>
                                    Đổi BN ✕
                                </Button>
                            }
                            sx={{ mt: 0 }}
                        >
                            Đã chọn
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* STEP 2 — Patient card */}
            {selectedPatient && (
                <Card sx={{ mb: 2, border: '1px solid #10b981', bgcolor: '#f0fdf4' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip label="2" size="small" color="success" />
                            <Typography variant="h6" fontWeight={600}>✅ Bệnh nhân đã chọn</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <PersonIcon color="success" />
                                    <Box>
                                        <Typography fontWeight={700}>{selectedPatient.fullName}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {selectedPatient.code}
                                            {selectedPatient.gender && ` · ${selectedPatient.gender === 'Male' ? 'Nam' : 'Nữ'}`}
                                            {age !== null && `, ${age} tuổi`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {selectedPatient.phone && (
                                    <Typography variant="body2">📞 {selectedPatient.phone}</Typography>
                                )}
                                {selectedPatient.address && (
                                    <Typography variant="body2">📍 {selectedPatient.address}</Typography>
                                )}
                            </Grid>
                            {selectedPatient.note && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fef9c3', p: 1, borderRadius: 1 }}>
                                        <WarningAmberIcon sx={{ color: '#b45309', fontSize: 18 }} />
                                        <Typography variant="body2" color="#92400e">
                                            <strong>Ghi chú:</strong> {selectedPatient.note}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* STEP 3 — Visit info */}
            <Card sx={{ mb: 3, opacity: selectedPatient ? 1 : 0.5, pointerEvents: selectedPatient ? 'auto' : 'none' }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Chip label="3" size="small" color={selectedPatient ? 'primary' : 'default'} />
                        <Typography variant="h6" fontWeight={600}>📋 Thông tin lượt khám</Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select label="Bác sĩ phụ trách" fullWidth
                                value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}
                            >
                                <MenuItem value="">— Chọn bác sĩ —</MenuItem>
                                {doctors.map((d) => (
                                    <MenuItem key={d.id} value={d.id}>
                                        {d.fullName}{d.specialty ? ` (${d.specialty})` : ''}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select label="Phòng khám" fullWidth
                                value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}
                            >
                                <MenuItem value="">— Chọn phòng —</MenuItem>
                                {rooms.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Lý do khám / Triệu chứng"
                                fullWidth multiline rows={3}
                                value={reason} onChange={(e) => setReason(e.target.value)}
                                placeholder="Bệnh nhân mô tả triệu chứng..."
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Actions */}
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/visits')}>Hủy</Button>
                <Button
                    variant="contained"
                    disabled={!selectedPatient || submitting}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                    onClick={handleSubmit}
                    sx={{ px: 4 }}
                >
                    {submitting ? 'Đang tạo...' : 'Tạo lượt khám'}
                </Button>
            </Box>

            {/* New Patient Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Tạo bệnh nhân mới</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <Controller name="fullName" control={pc} render={({ field }) => (
                                <TextField {...field} label="Họ và tên *" fullWidth error={!!pe.fullName} helperText={pe.fullName?.message} />
                            )} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="gender" control={pc} render={({ field }) => (
                                <TextField {...field} select label="Giới tính" fullWidth>
                                    <MenuItem value="">—</MenuItem>
                                    <MenuItem value="Male">Nam</MenuItem>
                                    <MenuItem value="Female">Nữ</MenuItem>
                                    <MenuItem value="Other">Khác</MenuItem>
                                </TextField>
                            )} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="phone" control={pc} render={({ field }) => (
                                <TextField {...field} label="Số điện thoại" fullWidth />
                            )} />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name="address" control={pc} render={({ field }) => (
                                <TextField {...field} label="Địa chỉ" fullWidth />
                            )} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setModalOpen(false)} variant="outlined">Hủy</Button>
                    <Button onClick={phs(handleCreatePatient)} variant="contained" disabled={creatingSaving}>
                        {creatingSaving ? 'Đang tạo...' : 'Tạo bệnh nhân'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
