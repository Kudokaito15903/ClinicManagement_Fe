import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Typography, Card, CardContent, Button, TextField,
    MenuItem, Grid, CircularProgress, Breadcrumbs, Link,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import { getPatient, createPatient, updatePatient } from '@/api/patients';

const schema = z.object({
    code: z.string().optional(),
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    birthYear: z.coerce.number().min(1900).max(2100).optional().or(z.literal('')),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PatientFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(isEdit);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { fullName: '', code: '', address: '', gender: '' as any },
    });

    useEffect(() => {
        if (!isEdit) return;
        getPatient(Number(id))
            .then((p) => reset({
                code: p.code,
                fullName: p.fullName,
                birthYear: p.birthYear ?? '',
                gender: p.gender ?? ('' as any),
                address: p.address ?? '',
            }))
            .catch(() => enqueueSnackbar('Không thể tải thông tin bệnh nhân', { variant: 'error' }))
            .finally(() => setInitLoading(false));
    }, [id, isEdit, reset, enqueueSnackbar]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                birthYear: data.birthYear ? Number(data.birthYear) : undefined,
            };
            if (isEdit) {
                await updatePatient(Number(id), payload);
                enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
            } else {
                await createPatient(payload);
                enqueueSnackbar('Thêm bệnh nhân thành công', { variant: 'success' });
            }
            navigate('/patients');
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Box>
            {/* Breadcrumb */}
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/patients')}>
                    Bệnh nhân
                </Link>
                <Typography color="text.primary">{isEdit ? 'Cập nhật' : 'Thêm mới'}</Typography>
            </Breadcrumbs>

            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
                {isEdit ? 'Cập nhật bệnh nhân' : 'Thêm bệnh nhân mới'}
            </Typography>

            <Card sx={{ maxWidth: 700 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Controller
                                    name="fullName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Họ và tên *"
                                            fullWidth
                                            error={!!errors.fullName}
                                            helperText={errors.fullName?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="birthYear"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Năm sinh"
                                            fullWidth
                                            type="number"
                                            error={!!errors.birthYear}
                                            helperText={errors.birthYear?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            label="Giới tính"
                                            fullWidth
                                            error={!!errors.gender}
                                            helperText={errors.gender?.message}
                                        >
                                            <MenuItem value="Male">Nam</MenuItem>
                                            <MenuItem value="Female">Nữ</MenuItem>
                                            <MenuItem value="Other">Khác</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Địa chỉ"
                                            fullWidth
                                            multiline
                                            rows={2}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/patients')}
                            >
                                Quay lại
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                disabled={loading}
                                sx={{ px: 4 }}
                            >
                                {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
