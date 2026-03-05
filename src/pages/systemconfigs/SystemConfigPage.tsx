import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, alpha,
    Skeleton, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { getSystemConfigs, updateSystemConfigs, updateSystemConfig, deleteSystemConfig } from '@/api/systemConfigs';
import type { SystemConfig } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function SystemConfigPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<SystemConfig | null>(null);
    const [deleteKey, setDeleteKey] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Bulk edit state
    const [bulkValues, setBulkValues] = useState<Record<string, string>>({});
    const [isBulkDirty, setIsBulkDirty] = useState(false);
    const [bulkSaving, setBulkSaving] = useState(false);

    // Form
    const { control, handleSubmit, reset } = useForm({
        defaultValues: { configKey: '', configValue: '', description: '' },
    });

    const fetch = useCallback(() => {
        setLoading(true);
        getSystemConfigs()
            .then((data) => {
                setConfigs(data);
                const initialBulk: Record<string, string> = {};
                data.forEach(c => { initialBulk[c.configKey] = c.configValue; });
                setBulkValues(initialBulk);
                setIsBulkDirty(false);
            })
            .catch(() => enqueueSnackbar('Không thể tải cấu hình', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [enqueueSnackbar]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleBulkChange = (key: string, val: string) => {
        setBulkValues(prev => ({ ...prev, [key]: val }));
        setIsBulkDirty(true);
    };

    const handleBulkSave = async () => {
        setBulkSaving(true);
        try {
            await updateSystemConfigs(bulkValues);
            enqueueSnackbar('Cập nhật cấu hình thành công', { variant: 'success' });
            fetch();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Lỗi cập nhật', { variant: 'error' });
        } finally {
            setBulkSaving(false);
        }
    };

    const openCreate = () => { setEditItem(null); reset({ configKey: '', configValue: '', description: '' }); setDialogOpen(true); };
    const openEdit = (c: SystemConfig) => { setEditItem(c); reset({ configKey: c.configKey, configValue: c.configValue, description: c.description ?? '' }); setDialogOpen(true); };

    const onSubmitSingle = async (data: any) => {
        setSaving(true);
        try {
            await updateSystemConfig(data.configKey, { configValue: data.configValue, description: data.description });
            enqueueSnackbar('Lưu thành công', { variant: 'success' });
            setDialogOpen(false);
            fetch();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Lỗi', { variant: 'error' });
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteKey) return;
        setDeleting(true);
        try {
            await deleteSystemConfig(deleteKey);
            enqueueSnackbar('Đã xoá cấu hình', { variant: 'success' });
            setDeleteKey(null);
            fetch();
        } catch { enqueueSnackbar('Xoá thất bại', { variant: 'error' }); }
        finally { setDeleting(false); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Cấu hình hệ thống</Typography>
                    <Typography color="text.secondary" variant="body2">Quản lý các tham số cấu hình chung</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={openCreate}
                        sx={{ borderRadius: '10px' }}>
                        Thêm cấu hình
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!isBulkDirty || bulkSaving}
                        onClick={handleBulkSave}
                        sx={{ borderRadius: '10px' }}>
                        {bulkSaving ? 'Đang lưu...' : 'Lưu tất cả'}
                    </Button>
                </Box>
            </Box>
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>{[1, 2, 3].map((k) => <Skeleton key={k} height={52} sx={{ mb: 1 }} />)}</Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '25%' }}>Khóa (Key)</TableCell>
                                    <TableCell sx={{ width: '35%' }}>Giá trị</TableCell>
                                    <TableCell sx={{ width: '25%' }}>Mô tả</TableCell>
                                    <TableCell align="right" sx={{ width: '15%' }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {configs.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>Chưa có cấu hình nào</TableCell></TableRow>
                                ) : configs.map((c) => (
                                    <TableRow key={c.configKey} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell><Typography fontWeight={500} sx={{ fontFamily: 'monospace' }}>{c.configKey}</Typography></TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                variant="outlined"
                                                value={bulkValues[c.configKey] ?? ''}
                                                onChange={(e) => handleBulkChange(c.configKey, e.target.value)}
                                                sx={{ bgcolor: bulkValues[c.configKey] !== c.configValue ? alpha('#ff9800', 0.1) : 'transparent' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{c.description ?? '—'}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Sửa chi tiết"><IconButton size="small" color="info" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Xoá"><IconButton size="small" color="error" onClick={() => setDeleteKey(c.configKey)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Cập nhật cấu hình' : 'Thêm cấu hình mới'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <Controller name="configKey" control={control} render={({ field }) => (
                                <TextField {...field} label="Key *" fullWidth disabled={!!editItem} helperText={!editItem ? "VD: clinic_name, examination_fee" : ""} />
                            )} />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name="configValue" control={control} render={({ field }) => (
                                <TextField {...field} label="Giá trị *" fullWidth />
                            )} />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name="description" control={control} render={({ field }) => (
                                <TextField {...field} label="Mô tả" fullWidth multiline rows={2} />
                            )} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Huỷ</Button>
                    <Button onClick={handleSubmit(onSubmitSingle)} variant="contained" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog open={!!deleteKey} message={`Xoá cấu hình ${deleteKey}?`} onConfirm={handleDelete} onClose={() => setDeleteKey(null)} loading={deleting} />
        </Box>
    );
}
