import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Grid, CircularProgress,
    Button, Divider, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, IconButton, Tooltip, Alert, alpha, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import { getVisitDetail, getVisitServices, addVisitService, deleteVisitService, getVisitBill, getVisitReceiptUrl } from '@/api/visits';
import { getServices } from '@/api/services';
import type { Visit, VisitServiceItem, MedService, Bill } from '@/types';
import BillModal from '@/components/BillModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import dayjs from 'dayjs';

const fmt = (n?: number | null) => (n ?? 0).toLocaleString('vi-VN') + ' ₫';

const statusLabel = (s?: string) => {
    if (s === 'received') return 'Đã tiếp nhận';
    if (s === 'examining') return 'Đang khám';
    if (s === 'done') return 'Hoàn thành';
    return s ?? '—';
};
const statusColor = (s?: string): 'warning' | 'info' | 'success' | 'default' => {
    if (s === 'received') return 'warning';
    if (s === 'examining') return 'info';
    if (s === 'done') return 'success';
    return 'default';
};

export default function VisitDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [visit, setVisit] = useState<Visit | null>(null);
    const [services, setServices] = useState<VisitServiceItem[]>([]);
    const [allServices, setAllServices] = useState<MedService[]>([]);
    const [loading, setLoading] = useState(true);
    const [bill, setBill] = useState<Bill | null>(null);
    const [billOpen, setBillOpen] = useState(false);

    // Add service form
    const [selectedSvc, setSelectedSvc] = useState('');
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    // Delete service
    const [deleteSvcId, setDeleteSvcId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        Promise.all([
            getVisitDetail(Number(id)),
            getVisitServices(Number(id)),
            getServices(),
        ]).then(([v, s, ms]) => {
            setVisit(v);
            setServices(s);
            setAllServices(ms);
        })
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [id, enqueueSnackbar]);

    const handleAddService = async () => {
        if (!selectedSvc) return;
        setAdding(true);
        try {
            await addVisitService(Number(id), { serviceId: Number(selectedSvc), quantity: qty });
            const s = await getVisitServices(Number(id));
            setServices(s);
            setSelectedSvc('');
            setQty(1);
            enqueueSnackbar('Đã thêm dịch vụ', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Thêm thất bại', { variant: 'error' });
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteService = async () => {
        if (!deleteSvcId) return;
        setDeleting(true);
        try {
            await deleteVisitService(Number(id), deleteSvcId);
            setServices((prev) => prev.filter((s) => s.id !== deleteSvcId));
            enqueueSnackbar('Đã xoá dịch vụ', { variant: 'success' });
            setDeleteSvcId(null);
        } catch {
            enqueueSnackbar('Xoá thất bại', { variant: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const handleViewBill = async () => {
        try {
            const b = await getVisitBill(Number(id));
            setBill(b);
            setBillOpen(true);
        } catch {
            enqueueSnackbar('Không thể tải phiếu thu', { variant: 'error' });
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (!visit) return <Alert severity="error">Không tìm thấy lần khám</Alert>;

    const totalServices = services.reduce((sum, s) => sum + s.subtotal, 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
                <Typography variant="h4" fontWeight={700} sx={{ flex: 1 }}>
                    Lần khám {visit.code ?? `#${visit.id}`}
                </Typography>
                <Chip label={statusLabel(visit.status)} color={statusColor(visit.status)} />
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/visits/${id}/edit`)}>
                    Sửa
                </Button>
                <Button variant="contained" startIcon={<ReceiptIcon />} onClick={handleViewBill}>
                    Phiếu thu
                </Button>
            </Box>

            {/* Visit Info */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Thông tin lần khám</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {[
                                { label: 'Bệnh nhân', value: visit.patient?.fullName ?? `ID: ${visit.patient?.id}` },
                                { label: 'Ngày khám', value: dayjs(visit.visitDate).format('DD/MM/YYYY HH:mm') },
                                { label: 'Bác sĩ', value: visit.doctor?.name ?? '—' },
                                { label: 'Phòng', value: visit.room?.name ?? '—' },
                                { label: 'Lý do khám', value: visit.reason ?? '—' },
                                { label: 'Kết luận', value: visit.conclusion ?? '—' },
                            ].map((item) => (
                                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                                    <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                                </Box>
                            ))}
                            {visit.diagnoses && visit.diagnoses.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Chẩn đoán</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {visit.diagnoses.map((d) => (
                                            <Chip key={d.id} label={`[${d.icdCode}] ${d.name}`} size="small" color="info" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Tổng kết tài chính</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography color="text.secondary">Dịch vụ ({services.length})</Typography>
                                <Typography>{fmt(totalServices)}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography fontWeight={700} variant="h6">Tổng dịch vụ</Typography>
                                <Typography fontWeight={700} variant="h6" color="primary.main">
                                    {fmt(totalServices)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Services */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Dịch vụ trong lần khám</Typography>

                    {/* Add service */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <TextField
                            select
                            label="Chọn dịch vụ"
                            value={selectedSvc}
                            onChange={(e) => setSelectedSvc(e.target.value)}
                            SelectProps={{ native: true }}
                            size="small"
                            sx={{ minWidth: 250 }}
                        >
                            <option value="">— Chọn —</option>
                            {allServices.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} — {fmt(s.price)}</option>
                            ))}
                        </TextField>
                        <TextField
                            label="Số lượng"
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                            size="small"
                            inputProps={{ min: 1 }}
                            sx={{ width: 100 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={adding ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                            disabled={adding || !selectedSvc}
                            onClick={handleAddService}
                        >
                            Thêm
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {services.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                            Chưa có dịch vụ nào
                        </Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Dịch vụ</TableCell>
                                    <TableCell align="center">Số lượng</TableCell>
                                    <TableCell align="right">Đơn giá</TableCell>
                                    <TableCell align="right">Thành tiền</TableCell>
                                    <TableCell align="center">Xoá</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {services.map((s) => (
                                    <TableRow key={s.id} hover>
                                        <TableCell>{s.serviceName}</TableCell>
                                        <TableCell align="center">{s.quantity}</TableCell>
                                        <TableCell align="right">{fmt(s.unitPrice)}</TableCell>
                                        <TableCell align="right"><strong>{fmt(s.subtotal)}</strong></TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Xoá dịch vụ">
                                                <IconButton size="small" color="error" onClick={() => setDeleteSvcId(s.id)}>
                                                    <DeleteIcon fontSize="small" />
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

            <BillModal
                open={billOpen}
                bill={bill}
                receiptUrl={getVisitReceiptUrl(Number(id))}
                onClose={() => setBillOpen(false)}
            />

            <ConfirmDialog
                open={!!deleteSvcId}
                message="Xoá dịch vụ này khỏi lần khám?"
                onConfirm={handleDeleteService}
                onClose={() => setDeleteSvcId(null)}
                loading={deleting}
            />
        </Box>
    );
}
