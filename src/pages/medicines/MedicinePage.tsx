import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Typography, Card, CardContent, Button, TextField, Grid,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Skeleton, alpha,
    InputAdornment, Chip, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { useSnackbar } from 'notistack';
import { getMedicines, createMedicine, updateMedicine, toggleMedicineActive } from '@/api/medicines';
import type { Medicine } from '@/types';

const schema = z.object({
    code: z.string().min(1, 'Mã không được trống'),
    name: z.string().min(1, 'Tên không được trống'),
    unit: z.string().min(1, 'Đơn vị tính không được trống'),
    ingredient: z.string().optional(),
    dosageForm: z.string().optional(),
    manufacturer: z.string().optional(),
    countryOfOrigin: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function MedicinePage() {
    const { enqueueSnackbar } = useSnackbar();
    const [items, setItems] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<Medicine | null>(null);
    const [saving, setSaving] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { code: '', name: '', unit: '', ingredient: '', dosageForm: '', manufacturer: '', countryOfOrigin: '' },
    });

    const fetch = useCallback(() => {
        setLoading(true);
        getMedicines()
            .then(setItems)
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [enqueueSnackbar]);

    useEffect(() => { fetch(); }, [fetch]);

    const openCreate = () => {
        setEditItem(null);
        reset({ code: '', name: '', unit: 'Viên', ingredient: '', dosageForm: '', manufacturer: '', countryOfOrigin: '' });
        setDialogOpen(true);
    };

    const openEdit = (s: Medicine) => {
        setEditItem(s);
        reset({
            code: s.code,
            name: s.name,
            unit: s.unit || '',
            ingredient: s.ingredient || '',
            dosageForm: s.dosageForm || '',
            manufacturer: s.manufacturer || '',
            countryOfOrigin: s.countryOfOrigin || ''
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        try {
            if (editItem) {
                await updateMedicine(editItem.id, data);
                enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
            } else {
                await createMedicine(data);
                enqueueSnackbar('Thêm thuốc thành công', { variant: 'success' });
            }
            setDialogOpen(false);
            fetch();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Lỗi lưu dữ liệu', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (s: Medicine) => {
        try {
            await toggleMedicineActive(s.id);
            setItems((prev) => prev.map((item) => (item.id === s.id ? { ...item, isActive: !item.isActive } : item)));
            enqueueSnackbar(`Đã ${s.isActive ? 'ngừng' : 'kích hoạt'} bán thuốc`, { variant: 'success' });
        } catch {
            enqueueSnackbar('Cập nhật trạng thái thất bại', { variant: 'error' });
        }
    };

    // Client-side filtering as the API might return all
    const filteredItems = useMemo(() => {
        let result = items;
        if (activeOnly) {
            result = result.filter(x => x.isActive);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(x =>
                x.code.toLowerCase().includes(q) ||
                x.name.toLowerCase().includes(q) ||
                (x.ingredient && x.ingredient.toLowerCase().includes(q))
            );
        }
        return result;
    }, [items, search, activeOnly]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Danh mục thuốc</Typography>
                    <Typography color="text.secondary" variant="body2">Quản lý các loại thuốc, dược phẩm</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: '10px' }}>Thêm thuốc mới</Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Tìm theo mã, tên thuốc, hoạt chất..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ minWidth: 300 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                        }}
                    />
                    <FormControlLabel
                        control={<Switch checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />}
                        label="Chỉ hiện thuốc đang bán"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>{[1, 2, 3, 4, 5].map((k) => <Skeleton key={k} height={52} sx={{ mb: 1 }} />)}</Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Mã</TableCell>
                                    <TableCell>Tên thuốc & Hoạt chất</TableCell>
                                    <TableCell>Dạng bào chế & ĐVT</TableCell>
                                    <TableCell>Nguồn gốc</TableCell>
                                    <TableCell align="right">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <LocalPharmacyIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                                <Typography>Không tìm thấy loại thuốc nào</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredItems.map((s) => (
                                    <TableRow key={s.id} hover sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) } }}>
                                        <TableCell>
                                            <Chip
                                                label={s.isActive ? 'Đang bán' : 'Tạm khóa'}
                                                size="small"
                                                color={s.isActive ? 'success' : 'default'}
                                                variant={s.isActive ? 'filled' : 'outlined'}
                                                onClick={() => handleToggleActive(s)}
                                                sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 600 }}>{s.code}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>{s.name}</Typography>
                                            {s.ingredient && <Typography variant="caption" color="text.secondary">{s.ingredient}</Typography>}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{s.dosageForm || '—'}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>/ {s.unit}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{s.manufacturer || '—'}</Typography>
                                            {s.countryOfOrigin && <Typography variant="caption" color="text.secondary">{s.countryOfOrigin}</Typography>}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Sửa thông tin">
                                                <IconButton size="small" color="info" onClick={() => openEdit(s)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Cập nhật thông tin thuốc' : 'Thêm danh mục thuốc mới'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12} sm={4}>
                            <Controller name="code" control={control} render={({ field }) => (
                                <TextField {...field} label="Mã thuốc *" fullWidth error={!!errors.code} helperText={errors.code?.message}
                                    disabled={!!editItem} // Code is read-only when editing
                                    inputProps={{ style: { textTransform: 'uppercase' } }}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            )} />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Controller name="name" control={control} render={({ field }) => (
                                <TextField {...field} label="Tên thuốc *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                            )} />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller name="ingredient" control={control} render={({ field }) => (
                                <TextField {...field} label="Hoạt chất chính" fullWidth placeholder="VD: Paracetamol" />
                            )} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller name="dosageForm" control={control} render={({ field }) => (
                                <TextField {...field} label="Dạng bào chế" fullWidth placeholder="VD: Viên nén, Dung dịch..." />
                            )} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="unit" control={control} render={({ field }) => (
                                <TextField {...field} label="Đơn vị tính *" fullWidth error={!!errors.unit} helperText={errors.unit?.message} placeholder="VD: Viên, Vỉ, Tuýp" />
                            )} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller name="manufacturer" control={control} render={({ field }) => (
                                <TextField {...field} label="Hãng sản xuất" fullWidth />
                            )} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="countryOfOrigin" control={control} render={({ field }) => (
                                <TextField {...field} label="Nước sản xuất" fullWidth />
                            )} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Huỷ</Button>
                    <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thông tin'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
