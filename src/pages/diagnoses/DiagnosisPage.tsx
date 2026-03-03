import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip,
    InputAdornment, Skeleton, alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import { getDiagnoses, createDiagnosis, updateDiagnosis, deleteDiagnosis } from '@/api/diagnoses';
import type { Diagnosis } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';

const schema = z.object({
    icdCode: z.string().min(1, 'Mã ICD không được trống'),
    name: z.string().min(1, 'Tên không được trống'),
    category: z.string().optional(),
    description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function DiagnosisPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [items, setItems] = useState<Diagnosis[]>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<Diagnosis | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { icdCode: '', name: '', category: '', description: '' },
    });

    const fetch = useCallback((kw?: string) => {
        setLoading(true);
        getDiagnoses(kw)
            .then(setItems)
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const openCreate = () => {
        setEditItem(null);
        reset({ icdCode: '', name: '', category: '', description: '' });
        setDialogOpen(true);
    };

    const openEdit = (d: Diagnosis) => {
        setEditItem(d);
        reset({ icdCode: d.icdCode, name: d.name, category: d.category ?? '', description: d.description ?? '' });
        setDialogOpen(true);
    };

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        try {
            if (editItem) {
                await updateDiagnosis(editItem.id, data);
                enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
            } else {
                await createDiagnosis(data);
                enqueueSnackbar('Thêm thành công', { variant: 'success' });
            }
            setDialogOpen(false);
            fetch(keyword);
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Lỗi', { variant: 'error' });
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteDiagnosis(deleteId);
            enqueueSnackbar('Đã xoá chẩn đoán', { variant: 'success' });
            setDeleteId(null);
            fetch(keyword);
        } catch { enqueueSnackbar('Xoá thất bại', { variant: 'error' }); }
        finally { setDeleting(false); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Chẩn đoán</Typography>
                    <Typography color="text.secondary" variant="body2">Danh mục mã ICD</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: '10px' }}>Thêm chẩn đoán</Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth size="small"
                            placeholder="Tìm theo tên hoặc mã ICD..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetch(keyword)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                        <Button variant="contained" onClick={() => fetch(keyword)} sx={{ borderRadius: '10px', px: 3 }}>Tìm</Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>{[1, 2, 3].map((k) => <Skeleton key={k} height={52} sx={{ mb: 1 }} />)}</Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã ICD</TableCell>
                                    <TableCell>Tên chẩn đoán</TableCell>
                                    <TableCell>Chuyên khoa</TableCell>
                                    <TableCell>Mô tả</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có kết quả</TableCell></TableRow>
                                ) : items.map((d) => (
                                    <TableRow key={d.id} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell><Chip label={d.icdCode} size="small" color="info" /></TableCell>
                                        <TableCell><Typography fontWeight={500}>{d.name}</Typography></TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{d.category ?? '—'}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', maxWidth: 200 }}>{d.description ?? '—'}</TableCell>
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editItem ? 'Cập nhật chẩn đoán' : 'Thêm chẩn đoán mới'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}><Controller name="icdCode" control={control} render={({ field }) => (
                            <TextField {...field} label="Mã ICD *" fullWidth error={!!errors.icdCode} helperText={errors.icdCode?.message} />
                        )} /></Grid>
                        <Grid item xs={12}><Controller name="name" control={control} render={({ field }) => (
                            <TextField {...field} label="Tên *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                        )} /></Grid>
                        <Grid item xs={12}><Controller name="category" control={control} render={({ field }) => (
                            <TextField {...field} label="Chuyên khoa" fullWidth />
                        )} /></Grid>
                        <Grid item xs={12}><Controller name="description" control={control} render={({ field }) => (
                            <TextField {...field} label="Mô tả" fullWidth multiline rows={2} />
                        )} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Huỷ</Button>
                    <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={!!deleteId} message="Xoá chẩn đoán này?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={deleting} />
        </Box>
    );
}
