import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Skeleton, alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { useSnackbar } from 'notistack';
import { getServices, createService, updateService, deleteService } from '@/api/services';
import type { MedService } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';

const schema = z.object({
    code: z.string().min(1, 'Mã không được trống'),
    name: z.string().min(1, 'Tên không được trống'),
    price: z.coerce.number().min(0, 'Giá phải >= 0'),
});
type FormData = z.infer<typeof schema>;

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function MedServicePage() {
    const { enqueueSnackbar } = useSnackbar();
    const [items, setItems] = useState<MedService[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<MedService | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { code: '', name: '', price: 0 },
    });

    const fetch = useCallback(() => {
        setLoading(true);
        getServices()
            .then(setItems)
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const openCreate = () => { setEditItem(null); reset({ code: '', name: '', price: 0 }); setDialogOpen(true); };
    const openEdit = (s: MedService) => { setEditItem(s); reset({ code: s.code, name: s.name, price: s.price }); setDialogOpen(true); };

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        try {
            if (editItem) { await updateService(editItem.id, data); enqueueSnackbar('Cập nhật thành công', { variant: 'success' }); }
            else { await createService(data); enqueueSnackbar('Thêm dịch vụ thành công', { variant: 'success' }); }
            setDialogOpen(false); fetch();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Lỗi', { variant: 'error' });
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteService(deleteId);
            enqueueSnackbar('Đã xoá dịch vụ', { variant: 'success' });
            setDeleteId(null); fetch();
        } catch { enqueueSnackbar('Xoá thất bại', { variant: 'error' }); }
        finally { setDeleting(false); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Dịch vụ y tế</Typography>
                    <Typography color="text.secondary" variant="body2">Quản lý danh mục dịch vụ và giá</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: '10px' }}>Thêm dịch vụ</Button>
            </Box>
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>{[1, 2, 3].map((k) => <Skeleton key={k} height={52} sx={{ mb: 1 }} />)}</Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã</TableCell>
                                    <TableCell>Tên dịch vụ</TableCell>
                                    <TableCell align="right">Đơn giá</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <MedicalServicesIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                                <Typography>Chưa có dịch vụ nào</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : items.map((s) => (
                                    <TableRow key={s.id} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 600 }}>{s.code}</TableCell>
                                        <TableCell><Typography fontWeight={500}>{s.name}</Typography></TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight={700} color="success.main">{fmt(s.price)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Sửa"><IconButton size="small" color="info" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Xoá"><IconButton size="small" color="error" onClick={() => setDeleteId(s.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editItem ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}><Controller name="code" control={control} render={({ field }) => (
                            <TextField {...field} label="Mã dịch vụ *" fullWidth error={!!errors.code} helperText={errors.code?.message} />
                        )} /></Grid>
                        <Grid item xs={12}><Controller name="name" control={control} render={({ field }) => (
                            <TextField {...field} label="Tên dịch vụ *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                        )} /></Grid>
                        <Grid item xs={12}><Controller name="price" control={control} render={({ field }) => (
                            <TextField {...field} label="Giá (VNĐ) *" fullWidth type="number" error={!!errors.price} helperText={errors.price?.message} />
                        )} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Huỷ</Button>
                    <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={!!deleteId} message="Xoá dịch vụ này?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={deleting} />
        </Box>
    );
}
