import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box, Typography, Card, CardContent, Button, TextField,
    Grid, CircularProgress, Breadcrumbs, Link,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import { createVisit, getVisit, updateVisit } from '@/api/visits';
import DoctorSelect from '@/components/DoctorSelect';
import RoomSelect from '@/components/RoomSelect';

const schema = z.object({
    patientId: z.coerce.number().min(1, 'Cần chọn bệnh nhân'),
    doctorId: z.number().nullable().optional(),
    roomId: z.number().nullable().optional(),
    reason: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function VisitFormPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(isEdit);

    const defaultPatientId = Number(searchParams.get('patientId')) || 0;

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            patientId: defaultPatientId,
            doctorId: null,
            roomId: null,
            reason: '',
        },
    });

    useEffect(() => {
        if (!isEdit) return;
        getVisit(Number(id))
            .then((v) => reset({
                patientId: v.patient?.id ?? v.patientId ?? 0,
                doctorId: v.doctor?.id ?? null,
                roomId: v.room?.id ?? null,
                reason: v.reason ?? '',
            }))
            .catch(() => enqueueSnackbar('Không thể tải lần khám', { variant: 'error' }))
            .finally(() => setInitLoading(false));
    }, [id, isEdit, reset, enqueueSnackbar]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (isEdit) {
                await updateVisit(Number(id), {
                    doctorId: data.doctorId ?? undefined,
                    roomId: data.roomId ?? undefined,
                    reason: data.reason,
                });
                enqueueSnackbar('Cập nhật lần khám thành công', { variant: 'success' });
                navigate(`/visits/${id}`);
            } else {
                const v = await createVisit({
                    patientId: data.patientId,
                    doctorId: data.doctorId ?? undefined,
                    roomId: data.roomId ?? undefined,
                    reason: data.reason,
                });
                enqueueSnackbar('Tạo lần khám thành công', { variant: 'success' });
                navigate(`/visits/${v.id}`);
            }
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/patients')}>
                    Bệnh nhân
                </Link>
                <Typography color="text.primary">{isEdit ? 'Cập nhật lần khám' : 'Tạo lần khám'}</Typography>
            </Breadcrumbs>

            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
                {isEdit ? 'Cập nhật lần khám' : 'Tạo lần khám mới'}
            </Typography>

            <Card sx={{ maxWidth: 700 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Controller
                                    name="patientId"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="ID Bệnh nhân *"
                                            fullWidth
                                            type="number"
                                            error={!!errors.patientId}
                                            helperText={errors.patientId?.message}
                                            disabled={isEdit}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <DoctorSelect
                                    value={watch('doctorId') ?? null}
                                    onChange={(v) => setValue('doctorId', v)}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <RoomSelect
                                    value={watch('roomId') ?? null}
                                    onChange={(v) => setValue('roomId', v)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="reason"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Lý do khám"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Vd: Ho, sốt, đau họng..."
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                                Quay lại
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                disabled={loading}
                                sx={{ px: 4 }}
                            >
                                {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo lần khám'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
