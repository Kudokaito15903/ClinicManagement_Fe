import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Grid, Button, Divider,
    Table, TableBody, TableCell, TableHead, TableRow, TextField,
    ToggleButton, ToggleButtonGroup, CircularProgress, Alert,
    alpha, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { getVisitDetail, createPayment, getVisitReceiptUrl, getVisitPayment } from '@/api/visits';
import type { Visit, VisitServiceItem, PaymentMethod } from '@/types';

const fmt = (n?: number | null) => (n ?? 0).toLocaleString('vi-VN') + ' ₫';

const METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'Cash', label: 'Tiền mặt', icon: '💵' },
    { value: 'Card', label: 'Thẻ', icon: '💳' },
    { value: 'Transfer', label: 'Chuyển khoản', icon: '🏦' },
];

export default function VisitPaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const visitId = Number(id);

    const [visit, setVisit] = useState<Visit | null>(null);
    const [services, setServices] = useState<VisitServiceItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [discount, setDiscount] = useState(0);
    const [examinationFee, setExaminationFee] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
    const [cashierNote, setCashierNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paidAmount, setPaidAmount] = useState(0);

    useEffect(() => {
        getVisitDetail(visitId)
            .then(async (data) => {
                setVisit(data.visit);
                setServices(data.services);
                setExaminationFee(data.examinationFee ?? 0);

                if (data.visit.status === 'Paid') {
                    try {
                        const payment = await getVisitPayment(visitId);
                        setPaidAmount(payment.finalAmount);
                        setPaymentMethod(payment.paymentMethod);
                        setSuccess(true);
                    } catch (e) {
                        // ignore if payment fetch fails
                    }
                }
            })
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [visitId, enqueueSnackbar]);

    const totalServices = services.reduce((s, item) => s + item.subtotal, 0);
    const grandTotal = totalServices + examinationFee;
    const actualPaid = Math.max(0, grandTotal - discount);

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const res = await createPayment(visitId, {
                examinationFee, // Send the pre-calculated fee from the detail API
                paymentMethod,
                discount: discount || undefined,
                cashierNote: cashierNote || null,
            });
            setPaidAmount(res.finalAmount);
            setSuccess(true);
            enqueueSnackbar('Thanh toán thành công!', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.error || err?.response?.data?.message || 'Thanh toán thất bại', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (!visit) return <Alert severity="error">Không tìm thấy lần khám</Alert>;

    // Success screen
    if (success) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <Card sx={{ maxWidth: 420, width: '100%', textAlign: 'center', p: 4 }}>
                    <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>✅</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mb: 0.5 }}>
                        Thanh toán thành công!
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {fmt(paidAmount)}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {METHODS.find((m) => m.value === paymentMethod)?.icon}{' '}
                        {METHODS.find((m) => m.value === paymentMethod)?.label}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => window.open(getVisitReceiptUrl(visitId), '_blank')}
                        >
                            In phiếu thu
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/visits')}>
                            Về danh sách
                        </Button>
                    </Box>
                </Card>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate(`/visits/${visitId}`)}>
                    Quay lại
                </Button>
                <Typography variant="h4" fontWeight={700}>Thu tiền bệnh nhân</Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left — Patient info */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Thông tin bệnh nhân</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="h6" fontWeight={700}>{visit.patient?.fullName ?? '—'}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{visit.patient?.code}</Typography>
                            {[
                                { label: 'Ngày khám', value: dayjs(visit.visitDate).format('DD/MM/YYYY — HH:mm') },
                                { label: 'Bác sĩ', value: visit.doctor?.name ?? '—' },
                                { label: 'Phòng', value: visit.room?.name ?? '—' },
                            ].map((r) => (
                                <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                                    <Typography variant="body2" fontWeight={500}>{r.value}</Typography>
                                </Box>
                            ))}
                            {visit.diagnoses && visit.diagnoses.length > 0 && (
                                <Box sx={{ mt: 1.5 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Chẩn đoán:</Typography>
                                    {visit.diagnoses.map((d) => (
                                        <Chip key={d.id} label={`${d.icdCode} — ${d.name}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right — Bill & Payment */}
                <Grid item xs={12} md={7}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Phiếu tính tiền</Typography>
                            <Divider sx={{ mb: 1.5 }} />

                            {/* Services */}
                            <Table size="small" sx={{ mb: 2 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Dịch vụ</TableCell>
                                        <TableCell align="center">SL</TableCell>
                                        <TableCell align="right">Tiền</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {services.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.serviceName}</TableCell>
                                            <TableCell align="center">{s.quantity}</TableCell>
                                            <TableCell align="right">{fmt(s.subtotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2, bgcolor: alpha('#2563eb', 0.03), p: 1.5, borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Tổng dịch vụ:</Typography>
                                    <Typography>{fmt(totalServices)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Tiền khám bác sĩ:</Typography>
                                    <Typography>{fmt(examinationFee)}</Typography>
                                </Box>
                                <Divider sx={{ my: 0.5 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography fontWeight={700}>Tổng cộng:</Typography>
                                    <Typography fontWeight={700}>{fmt(grandTotal)}</Typography>
                                </Box>
                            </Box>

                            {/* Discount */}
                            <TextField
                                label="Giảm giá (₫)"
                                type="number"
                                fullWidth size="small"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                inputProps={{ min: 0 }}
                                sx={{ mb: 2 }}
                            />

                            {/* Actual paid */}
                            <Box sx={{ bgcolor: '#eff6ff', border: '2px solid #2563eb', borderRadius: 2, p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight={700}>THỰC THU:</Typography>
                                <Typography variant="h5" fontWeight={800} color="primary.main">{fmt(actualPaid)}</Typography>
                            </Box>

                            {/* Payment method */}
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Hình thức thanh toán:</Typography>
                            <ToggleButtonGroup
                                exclusive value={paymentMethod}
                                onChange={(_, v) => v && setPaymentMethod(v)}
                                sx={{ mb: 2, display: 'flex', gap: 1 }}
                            >
                                {METHODS.map((m) => (
                                    <ToggleButton key={m.value} value={m.value} sx={{ flex: 1, py: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography fontSize="1.4rem">{m.icon}</Typography>
                                            <Typography variant="caption">{m.label}</Typography>
                                        </Box>
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>

                            {/* Note */}
                            <TextField
                                label="Ghi chú thu ngân"
                                fullWidth size="small"
                                value={cashierNote}
                                onChange={(e) => setCashierNote(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            {/* Actions */}
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Button variant="outlined" startIcon={<PrintIcon />}
                                    onClick={() => window.open(getVisitReceiptUrl(visitId), '_blank')}
                                    sx={{ flex: 1 }}>
                                    In phiếu
                                </Button>
                                <Button
                                    variant="contained" color="success"
                                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                                    disabled={submitting}
                                    onClick={handleConfirm}
                                    sx={{ flex: 2 }}
                                >
                                    {submitting ? 'Đang xử lý...' : 'Xác nhận thu'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
