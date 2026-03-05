import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip,
    Skeleton, Tooltip, Avatar, alpha, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useSnackbar } from 'notistack';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '@/api/doctors';
import type { Doctor, AcademicTitle } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';

const AcademicTitleMap: Record<string, string> = {
    'None': 'Không có',
    'Master_CKI': 'Thạc sĩ / CKI',
    'PhD_CKII': 'Tiến sĩ / CKII',
    'AssociateProfessor': 'Phó Giáo sư',
    'Professor': 'Giáo sư',
};

const ACADEMIC_TITLES: AcademicTitle[] = ['None', 'Master_CKI', 'PhD_CKII', 'AssociateProfessor', 'Professor'];

const schema = z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    specialty: z.string().optional().nullable(),
    academicTitle: z.enum(['None', 'Master_CKI', 'PhD_CKII', 'AssociateProfessor', 'Professor']).nullable().optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')).nullable(),
});
type FormData = z.infer<typeof schema>;

export default function DoctorPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<Doctor | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { fullName: '', specialty: '', academicTitle: 'None', phone: '', email: '' },
    });

    const fetch = useCallback(() => {
        setLoading(true);
        getDoctors()
            .then(setDoctors)
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    // Only show active doctors (soft-delete: isActive === false means deleted)
    const activeDoctors = doctors.filter((d) => d.isActive);

    const openCreate = () => {
        setEditItem(null);
        reset({ fullName: '', specialty: '', academicTitle: 'None', phone: '', email: '' });
        setDialogOpen(true);
    };

    const openEdit = (d: Doctor) => {
        setEditItem(d);
        reset({
            fullName: d.fullName,
            specialty: d.specialty ?? '',
            // Per API spec: academicTitle=null on PUT means "keep old value", so pre-fill with existing
            academicTitle: d.academicTitle ?? 'None',
            phone: d.phone ?? '',
            email: d.email ?? '',
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        try {
            // Normalise empty strings to null for optional fields
            const payload = {
                fullName: data.fullName,
                specialty: data.specialty || null,
                // Per API spec: null means "keep old value" on PUT, so only send null on create if truly unset
                academicTitle: data.academicTitle ?? null,
                phone: data.phone || null,
                email: data.email || null,
            };

            if (editItem) {
                await updateDoctor(editItem.id, payload);
                enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
            } else {
                await createDoctor(payload);
                enqueueSnackbar('Thêm bác sĩ thành công', { variant: 'success' });
            }
            setDialogOpen(false);
            fetch();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Lỗi', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteDoctor(deleteId);
            enqueueSnackbar('Đã xoá bác sĩ', { variant: 'success' });
            setDeleteId(null);
            fetch();
        } catch {
            enqueueSnackbar('Xoá thất bại', { variant: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Bác sĩ</Typography>
                    <Typography color="text.secondary" variant="body2">Quản lý danh sách bác sĩ</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: '10px' }}>
                    Thêm bác sĩ
                </Button>
            </Box>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>{[1, 2, 3].map((k) => <Skeleton key={k} height={52} sx={{ mb: 1 }} />)}</Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã BS</TableCell>
                                    <TableCell>Bác sĩ</TableCell>
                                    <TableCell>Học hàm / Học vị</TableCell>
                                    <TableCell>Chuyên khoa</TableCell>
                                    <TableCell>Liên hệ</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activeDoctors.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Chưa có bác sĩ nào</TableCell></TableRow>
                                ) : activeDoctors.map((d) => (
                                    <TableRow key={d.id} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">{d.code}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: '0.8rem' }}>
                                                    <LocalHospitalIcon fontSize="small" />
                                                </Avatar>
                                                <Typography fontWeight={500}>{d.fullName}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {d.academicTitle && d.academicTitle !== 'None'
                                                ? <Chip label={AcademicTitleMap[d.academicTitle]} size="small" variant="outlined" color="primary" />
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {d.specialty ? <Chip label={d.specialty} size="small" variant="outlined" color="secondary" /> : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                {d.phone && <Typography variant="body2">{d.phone}</Typography>}
                                                {d.email && <Typography variant="caption" color="text.secondary">{d.email}</Typography>}
                                                {!d.phone && !d.email && '—'}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Sửa"><IconButton size="small" color="info" onClick={() => openEdit(d)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Xoá"><IconButton size="small" color="error" onClick={() => setDeleteId(d.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editItem ? 'Cập nhật bác sĩ' : 'Thêm bác sĩ mới'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller name="fullName" control={control} render={({ field }) => (
                                    <TextField {...field} label="Họ và tên *" fullWidth error={!!errors.fullName} helperText={errors.fullName?.message} />
                                )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="academicTitle" control={control} render={({ field }) => (
                                    <TextField {...field} value={field.value ?? 'None'} label="Học hàm / Học vị" fullWidth select>
                                        {ACADEMIC_TITLES.map((t) => (
                                            <MenuItem key={t} value={t}>{AcademicTitleMap[t]}</MenuItem>
                                        ))}
                                    </TextField>
                                )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="specialty" control={control} render={({ field }) => (
                                    <TextField {...field} value={field.value ?? ''} label="Chuyên khoa" fullWidth />
                                )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="phone" control={control} render={({ field }) => (
                                    <TextField {...field} value={field.value ?? ''} label="Số điện thoại" fullWidth />
                                )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="email" control={control} render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value ?? ''}
                                        label="Email"
                                        fullWidth
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                )} />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Huỷ</Button>
                    <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={!!deleteId} message="Bạn có chắc muốn xoá bác sĩ này?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={deleting} />
        </Box>
    );
}
