import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, alpha,
    Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { getRooms, createRoom, updateRoom, deleteRoom } from '@/api/rooms';
import type { Room } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';

const schema = z.object({
    name: z.string().min(1, 'Tên phòng không được trống'),
    description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RoomPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<Room | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', description: '' },
    });

    const fetch = useCallback(() => {
        setLoading(true);
        getRooms()
            .then(setRooms)
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [enqueueSnackbar]);

    useEffect(() => { fetch(); }, [fetch]);

    const openCreate = () => { setEditItem(null); reset({ name: '', description: '' }); setDialogOpen(true); };
    const openEdit = (r: Room) => { setEditItem(r); reset({ name: r.name, description: r.description ?? '' }); setDialogOpen(true); };

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        try {
            if (editItem) { await updateRoom(editItem.id, data); enqueueSnackbar('Cập nhật thành công', { variant: 'success' }); }
            else { await createRoom(data); enqueueSnackbar('Thêm phòng thành công', { variant: 'success' }); }
            setDialogOpen(false); fetch();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Lỗi', { variant: 'error' });
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteRoom(deleteId);
            enqueueSnackbar('Đã xoá phòng', { variant: 'success' });
            setDeleteId(null); fetch();
        } catch { enqueueSnackbar('Xoá thất bại', { variant: 'error' }); }
        finally { setDeleting(false); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Phòng khám</Typography>
                    <Typography color="text.secondary" variant="body2">Quản lý danh sách phòng khám</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: '10px' }}>Thêm phòng</Button>
            </Box>
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>{[1, 2, 3].map((k) => <Skeleton key={k} height={52} sx={{ mb: 1 }} />)}</Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Tên phòng</TableCell>
                                    <TableCell>Mô tả</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rooms.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>Chưa có phòng nào</TableCell></TableRow>
                                ) : rooms.map((r) => (
                                    <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell>#{r.id}</TableCell>
                                        <TableCell><Typography fontWeight={500}>{r.name}</Typography></TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{r.description ?? '—'}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Sửa"><IconButton size="small" color="info" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Xoá"><IconButton size="small" color="error" onClick={() => setDeleteId(r.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editItem ? 'Cập nhật phòng' : 'Thêm phòng mới'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <Controller name="name" control={control} render={({ field }) => (
                                <TextField {...field} label="Tên phòng *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                            )} />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name="description" control={control} render={({ field }) => (
                                <TextField {...field} label="Mô tả" fullWidth />
                            )} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Huỷ</Button>
                    <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog open={!!deleteId} message="Xoá phòng này?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={deleting} />
        </Box>
    );
}
