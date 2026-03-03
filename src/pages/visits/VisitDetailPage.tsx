import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Grid, Chip, Button,
    CircularProgress, Alert, Divider, Tabs, Tab, TextField,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton,
    Tooltip, Badge, Dialog, DialogTitle, DialogContent, DialogActions,
    RadioGroup, FormControlLabel, Radio, List, ListItemButton, ListItemIcon,
    ListItemText, InputAdornment, Accordion, AccordionSummary,
    AccordionDetails, alpha,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import PersonIcon from '@mui/icons-material/Person';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import {
    getVisitDetail, updateVisit, updateVisitStatus,
    getVisitServices, addVisitService, deleteVisitService,
    getVisitDiagnoses, addVisitDiagnosis, deleteVisitDiagnosis,
    getVisitBill,
} from '@/api/visits';
import { getPatientVisits } from '@/api/patients';
import { getDiagnoses } from '@/api/diagnoses';
import { getServices } from '@/api/services';
import type { Visit, VisitDetailResponse, VisitServiceItem, VisitDiagnosis, MedService, Diagnosis, Bill } from '@/types';
import BillModal from '@/components/BillModal';
import ConfirmDialog from '@/components/ConfirmDialog';

const fmt = (n?: number | null) => (n ?? 0).toLocaleString('vi-VN') + ' ₫';

const STATUS_FLOW = ['Received', 'Examining', 'WaitingResult', 'Completed', 'Paid'];
const STATUS_LABEL: Record<string, string> = {
    Received: 'Tiếp nhận',
    Examining: 'Đang khám',
    WaitingResult: 'Chờ KQ',
    Completed: 'Hoàn thành',
    Paid: 'Đã TT',
};
const STATUS_COLOR: Record<string, string> = {
    Received: '#1D4ED8',
    Examining: '#92400E',
    WaitingResult: '#C2410C',
    Completed: '#15803D',
    Paid: '#64748B',
};
const STATUS_BG: Record<string, string> = {
    Received: '#EFF6FF',
    Examining: '#FEFCE8',
    WaitingResult: '#FFF7ED',
    Completed: '#F0FDF4',
    Paid: '#F8FAFC',
};
const STATUS_EMOJI: Record<string, string> = {
    Received: '🔵', Examining: '🟡', WaitingResult: '🟠', Completed: '🟢', Paid: '✅',
};


interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
    return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function VisitDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const visitId = Number(id);

    const [visit, setVisit] = useState<Visit | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [changingStatus, setChangingStatus] = useState(false);

    // Services
    const [services, setServices] = useState<VisitServiceItem[]>([]);
    const [allServices, setAllServices] = useState<MedService[]>([]);
    const [svcDialogOpen, setSvcDialogOpen] = useState(false);
    const [svcFilter, setSvcFilter] = useState('');
    const [selectedSvc, setSelectedSvc] = useState<MedService | null>(null);
    const [svcQty, setSvcQty] = useState(1);
    const [addingSvc, setAddingSvc] = useState(false);
    const [deleteSvcId, setDeleteSvcId] = useState<number | null>(null);

    // Diagnoses
    const [diagList, setDiagList] = useState<VisitDiagnosis[]>([]);
    const [allDiag, setAllDiag] = useState<Diagnosis[]>([]);
    const [diagDialogOpen, setDiagDialogOpen] = useState(false);
    const [diagFilter, setDiagFilter] = useState('');
    const [selectedDiag, setSelectedDiag] = useState<Diagnosis | null>(null);
    const [diagType, setDiagType] = useState<'primary' | 'secondary'>('primary');
    const [diagNote, setDiagNote] = useState('');
    const [addingDiag, setAddingDiag] = useState(false);
    const [deleteDiagId, setDeleteDiagId] = useState<number | null>(null);

    // Conclusion
    const [conclusion, setConclusion] = useState('');
    const [savingConclusion, setSavingConclusion] = useState(false);

    // History
    const [history, setHistory] = useState<Visit[]>([]);
    const [expandedHistory, setExpandedHistory] = useState<number | false>(false);

    // Bill modal
    const [bill, setBill] = useState<Bill | null>(null);
    const [billOpen, setBillOpen] = useState(false);

    // Stores the extra totals from the detail response
    const [examinationFee, setExaminationFee] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    const applyDetailResponse = (data: VisitDetailResponse) => {
        setVisit(data.visit);
        setConclusion(data.visit.conclusion ?? '');
        setServices(data.services);
        setExaminationFee(data.examinationFee);
        setGrandTotal(data.grandTotal);
    };

    const reloadDetail = async () => {
        const data = await getVisitDetail(visitId);
        applyDetailResponse(data);
        return data;
    };

    useEffect(() => {
        Promise.all([
            getVisitDetail(visitId),
            getVisitDiagnoses(visitId),
            getServices(),
            getDiagnoses(),
        ]).then(([data, diags, allSvcs, allD]) => {
            applyDetailResponse(data);
            setDiagList(diags);
            setAllServices(allSvcs);
            setAllDiag(allD);
            // Load patient history
            if (data.visit.patient?.id) {
                getPatientVisits(data.visit.patient.id)
                    .then((h) => {
                        const prev = h.filter((x) => x.id !== visitId);
                        setHistory(prev);
                        if (prev.length > 0) setExpandedHistory(prev[0].id);
                    })
                    .catch(() => { });
            }
        })
            .catch(() => enqueueSnackbar('Không thể tải dữ liệu', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [visitId]);

    // Status navigation
    const statusIdx = STATUS_FLOW.indexOf(visit?.status ?? '');
    const prevStatus = statusIdx > 0 ? STATUS_FLOW[statusIdx - 1] : null;
    const nextStatus = statusIdx >= 0 && statusIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[statusIdx + 1] : null;

    const handleChangeStatus = async (newStatus: string) => {
        setChangingStatus(true);
        try {
            const v = await updateVisitStatus(visitId, { status: newStatus as any });
            setVisit(v);
            enqueueSnackbar(`Chuyển sang "${STATUS_LABEL[newStatus]}"`, { variant: 'success' });
        } catch {
            enqueueSnackbar('Không thể chuyển trạng thái', { variant: 'error' });
        } finally {
            setChangingStatus(false);
        }
    };

    // Conclusion save
    const handleSaveConclusion = async () => {
        setSavingConclusion(true);
        try {
            await updateVisit(visitId, { conclusion });
            enqueueSnackbar('Lưu kết luận thành công', { variant: 'success' });
        } catch {
            enqueueSnackbar('Lưu thất bại', { variant: 'error' });
        } finally {
            setSavingConclusion(false);
        }
    };

    const handleCompleteVisit = async () => {
        setSavingConclusion(true);
        try {
            await updateVisit(visitId, { conclusion });
            await updateVisitStatus(visitId, { status: 'Completed' as any });
            await reloadDetail();
            enqueueSnackbar('Hoàn thành khám!', { variant: 'success' });
        } catch {
            enqueueSnackbar('Lỗi khi hoàn thành', { variant: 'error' });
        } finally {
            setSavingConclusion(false);
        }
    };

    // Services
    const filteredSvcs = allServices.filter((s) =>
        !svcFilter || s.name.toLowerCase().includes(svcFilter.toLowerCase())
    );
    const handleAddService = async () => {
        if (!selectedSvc) return;
        setAddingSvc(true);
        try {
            await addVisitService(visitId, { serviceId: selectedSvc.id, quantity: svcQty });
            setServices(await getVisitServices(visitId));
            setSvcDialogOpen(false);
            setSelectedSvc(null);
            setSvcQty(1);
            setSvcFilter('');
            enqueueSnackbar('Đã thêm dịch vụ', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Thêm thất bại', { variant: 'error' });
        } finally {
            setAddingSvc(false);
        }
    };
    const handleDeleteService = async () => {
        if (!deleteSvcId) return;
        try {
            await deleteVisitService(visitId, deleteSvcId);
            setServices((p) => p.filter((s) => s.id !== deleteSvcId));
            enqueueSnackbar('Đã xoá dịch vụ', { variant: 'success' });
            setDeleteSvcId(null);
        } catch { enqueueSnackbar('Xoá thất bại', { variant: 'error' }); }
    };

    // Diagnoses
    const filteredDiag = allDiag.filter((d) =>
        !diagFilter || d.name.toLowerCase().includes(diagFilter.toLowerCase()) || d.icdCode.toLowerCase().includes(diagFilter.toLowerCase())
    );
    const handleAddDiagnosis = async () => {
        if (!selectedDiag) return;
        setAddingDiag(true);
        try {
            await addVisitDiagnosis(visitId, { diagnosisId: selectedDiag.id, type: diagType, note: diagNote || undefined });
            setDiagList(await getVisitDiagnoses(visitId));
            setDiagDialogOpen(false);
            setSelectedDiag(null);
            setDiagNote('');
            enqueueSnackbar('Đã thêm chẩn đoán', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || 'Thêm thất bại', { variant: 'error' });
        } finally {
            setAddingDiag(false);
        }
    };
    const handleDeleteDiagnosis = async () => {
        if (!deleteDiagId) return;
        try {
            await deleteVisitDiagnosis(visitId, deleteDiagId);
            setDiagList((p) => p.filter((d) => d.id !== deleteDiagId));
            enqueueSnackbar('Đã xoá chẩn đoán', { variant: 'success' });
            setDeleteDiagId(null);
        } catch { enqueueSnackbar('Xoá thất bại', { variant: 'error' }); }
    };

    const handleViewBill = async () => {
        try {
            const b = await getVisitBill(visitId);
            setBill(b);
            setBillOpen(true);
        } catch { enqueueSnackbar('Không thể tải phiếu thu', { variant: 'error' }); }
    };

    const totalServices = services.reduce((s, item) => s + item.subtotal, 0);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (!visit) return <Alert severity="error">Không tìm thấy lần khám</Alert>;

    const sd = { color: STATUS_COLOR[visit.status ?? ''] ?? '#64748b', bg: STATUS_BG[visit.status ?? ''] ?? '#f8fafc' };

    return (
        <Box>
            {/* ── HEADER ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate('/visits')}>Quay lại</Button>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography variant="h5" fontWeight={700}>{visit.code ?? `#${visitId}`}</Typography>
                        <Chip
                            label={`${STATUS_EMOJI[visit.status ?? ''] ?? ''} ${STATUS_LABEL[visit.status ?? ''] ?? visit.status}`}
                            size="small"
                            sx={{ bgcolor: sd.bg, color: sd.color, fontWeight: 700, border: `1px solid ${alpha(sd.color, 0.3)}` }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {dayjs(visit.visitDate).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                </Box>
            </Box>

            {/* Progress Steps */}
            <Card sx={{ mb: 2, overflow: 'visible' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {STATUS_FLOW.map((s, i) => {
                            const done = statusIdx > i;
                            const active = statusIdx === i;
                            const sc = done ? '#16a34a' : active ? STATUS_COLOR[s] : '#94a3b8';
                            return (
                                <Box key={s} sx={{ display: 'flex', alignItems: 'center', flex: i < STATUS_FLOW.length - 1 ? 1 : 'none' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                                        <Box sx={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            bgcolor: done ? '#dcfce7' : active ? STATUS_BG[s] : '#f1f5f9',
                                            border: `2px solid ${sc}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '13px',
                                        }}>
                                            {done ? '✓' : STATUS_EMOJI[s] ?? '○'}
                                        </Box>
                                        <Typography variant="caption" sx={{ color: sc, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap', fontSize: '0.65rem' }}>
                                            {STATUS_LABEL[s]}
                                        </Typography>
                                    </Box>
                                    {i < STATUS_FLOW.length - 1 && (
                                        <Box sx={{ flex: 1, height: 2, bgcolor: done ? '#16a34a' : '#e2e8f0', mx: 0.5, mb: 2 }} />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {prevStatus && prevStatus !== 'received' && (
                            <Button size="small" variant="outlined" startIcon={<ArrowBackIosIcon sx={{ fontSize: 12 }} />}
                                onClick={() => handleChangeStatus(prevStatus)} disabled={changingStatus}>
                                ← {STATUS_LABEL[prevStatus]}
                            </Button>
                        )}
                        {nextStatus && visit.status !== 'paid' && visit.status !== 'completed' && (
                            <Button size="small" variant="contained" endIcon={<ArrowForwardIcon />}
                                onClick={() => handleChangeStatus(nextStatus)} disabled={changingStatus}>
                                {STATUS_LABEL[nextStatus]} →
                            </Button>
                        )}
                        {visit.status === 'completed' && (
                            <Button size="small" variant="contained" color="success" startIcon={<AttachMoneyIcon />}
                                onClick={() => navigate(`/visits/${visitId}/payment`)}>
                                💰 Thu tiền
                            </Button>
                        )}
                        {visit.status === 'paid' && (
                            <Button size="small" variant="outlined" onClick={handleViewBill}>🖨 Phiếu thu</Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* ── 2-column info ── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Thông tin lượt khám</Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            {[
                                { label: 'Ngày khám', value: dayjs(visit.visitDate).format('DD/MM/YYYY — HH:mm') },
                                { label: 'Bác sĩ phụ trách', value: visit.doctor?.name ?? '—' },
                                { label: 'Phòng khám', value: visit.room?.name ?? '—' },
                                { label: 'Lý do khám', value: visit.reason || '—' },
                            ].map((r) => (
                                <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.7, borderBottom: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right', maxWidth: '60%' }}>{r.value}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight={600}>Thông tin bệnh nhân</Typography>
                                {visit.patient?.id && (
                                    <Button size="small" startIcon={<PersonIcon />}
                                        onClick={() => navigate(`/patients/${visit.patient!.id}`)}>
                                        Hồ sơ đầy đủ
                                    </Button>
                                )}
                            </Box>
                            <Divider sx={{ mb: 1.5 }} />
                            {visit.patient && (() => {
                                const p = visit.patient!;
                                const age = p.dateOfBirth ? dayjs().diff(dayjs(p.dateOfBirth), 'year') : null;
                                return (
                                    <>
                                        <Typography fontWeight={700} variant="h6">{p.fullName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{p.code}</Typography>
                                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                            {p.dateOfBirth && <Typography variant="body2">📅 {dayjs(p.dateOfBirth).format('DD/MM/YYYY')}{age !== null ? ` (${age} tuổi)` : ''}</Typography>}
                                            {p.gender && <Typography variant="body2">⚧ {p.gender === 'Male' ? 'Nam' : p.gender === 'Female' ? 'Nữ' : 'Khác'}</Typography>}
                                            {p.phone && <Typography variant="body2">📞 {p.phone}</Typography>}
                                            {p.address && <Typography variant="body2">📍 {p.address}</Typography>}
                                            {p.note && (
                                                <Box sx={{ bgcolor: '#fef9c3', p: 1, borderRadius: 1, mt: 0.5, display: 'flex', gap: 0.5 }}>
                                                    <Typography variant="body2" color="#92400e">⚠️ <strong>Ghi chú:</strong> {p.note}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── TABS ── */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label="🩺 Chẩn đoán & Kết luận" />
                        <Tab label={<Badge badgeContent={services.length} color="primary" sx={{ pr: 1 }}>🔬 Dịch vụ</Badge>} />
                        <Tab label={<Badge badgeContent={history.length} color="secondary" sx={{ pr: 1 }}>📖 Lịch sử khám</Badge>} />
                    </Tabs>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    {/* ── TAB 0: Diagnoses & Conclusion ── */}
                    <TabPanel value={tab} index={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight={600}>CHẨN ĐOÁN</Typography>
                            <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={() => setDiagDialogOpen(true)}>
                                + Thêm ICD
                            </Button>
                        </Box>

                        {diagList.length === 0 ? (
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>Chưa có chẩn đoán</Typography>
                        ) : (
                            <Box sx={{ mb: 2 }}>
                                {diagList.map((d) => (
                                    <Box key={d.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 0.5, borderRadius: 1, bgcolor: alpha('#2563eb', 0.04), border: '1px solid', borderColor: 'divider' }}>
                                        <Chip
                                            label={d.type === 'primary' ? '🔴 CHÍNH' : '🟡 PHỤ'}
                                            size="small"
                                            sx={{ fontSize: '0.65rem' }}
                                        />
                                        <Chip label={d.icdCode} size="small" color="info" />
                                        <Typography variant="body2" sx={{ flex: 1 }}>{d.name}</Typography>
                                        <Tooltip title="Xoá">
                                            <IconButton size="small" color="error" onClick={() => setDeleteDiagId(d.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Divider sx={{ mb: 2 }} />

                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>KẾT LUẬN CỦA BÁC SĨ</Typography>
                        <TextField
                            fullWidth multiline rows={5}
                            value={conclusion}
                            onChange={(e) => setConclusion(e.target.value)}
                            placeholder="Nhập kết luận, hướng điều trị, lưu ý..."
                            inputProps={{ maxLength: 1000 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                {conclusion.length}/1000 ký tự
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined" size="small"
                                    startIcon={savingConclusion ? <CircularProgress size={14} /> : <SaveIcon />}
                                    onClick={handleSaveConclusion} disabled={savingConclusion}
                                >
                                    Lưu kết luận
                                </Button>
                                {(visit.status === 'examining' || visit.status === 'waiting_result') && (
                                    <Button
                                        variant="contained" size="small" color="success"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={handleCompleteVisit} disabled={savingConclusion}
                                    >
                                        ✅ Hoàn thành
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </TabPanel>

                    {/* ── TAB 1: Services ── */}
                    <TabPanel value={tab} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight={600}>DỊCH VỤ CHỈ ĐỊNH</Typography>
                            <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={() => setSvcDialogOpen(true)}>
                                + Thêm dịch vụ
                            </Button>
                        </Box>

                        {services.length === 0 ? (
                            <Typography color="text.secondary">Chưa có dịch vụ</Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tên dịch vụ</TableCell>
                                        <TableCell align="center">SL</TableCell>
                                        <TableCell align="right">Đơn giá</TableCell>
                                        <TableCell align="right">T.Tiền</TableCell>
                                        <TableCell align="center"></TableCell>
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
                                                <IconButton size="small" color="error" onClick={() => setDeleteSvcId(s.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: 280 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography color="text.secondary">Tổng dịch vụ:</Typography>
                                    <Typography fontWeight={600}>{fmt(totalServices)}</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" fontWeight={700}>TỔNG CỘNG:</Typography>
                                    <Typography variant="h6" fontWeight={700} color="primary.main">{fmt(totalServices)}</Typography>
                                </Box>
                                {visit.status === 'completed' && (
                                    <Button fullWidth variant="contained" color="success" sx={{ mt: 2 }}
                                        startIcon={<AttachMoneyIcon />}
                                        onClick={() => navigate(`/visits/${visitId}/payment`)}>
                                        💰 Chuyển sang Thu tiền
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </TabPanel>

                    {/* ── TAB 2: History ── */}
                    <TabPanel value={tab} index={2}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                            LỊCH SỬ KHÁM — {visit.patient?.fullName} ({history.length} lần trước)
                        </Typography>
                        <Divider sx={{ mb: 1.5 }} />
                        {history.length === 0 ? (
                            <Typography color="text.secondary">Không có lịch sử khám trước</Typography>
                        ) : history.map((h) => (
                            <Accordion
                                key={h.id}
                                expanded={expandedHistory === h.id}
                                onChange={(_, open) => setExpandedHistory(open ? h.id : false)}
                                sx={{ mb: 0.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                                        <Typography fontWeight={500}>{dayjs(h.visitDate).format('DD/MM/YYYY')}</Typography>
                                        <Typography variant="body2" color="text.secondary">{h.doctor?.name ?? '—'}</Typography>
                                        <Typography variant="body2" color="text.secondary">{h.room?.name ?? '—'}</Typography>
                                        <Chip label={h.status === 'paid' ? '✅' : STATUS_LABEL[h.status ?? '']} size="small" />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ bgcolor: alpha('#2563eb', 0.02) }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {h.reason && <Typography variant="body2"><strong>Lý do:</strong> {h.reason}</Typography>}
                                        {h.diagnoses && h.diagnoses.length > 0 && (
                                            <Box>
                                                <Typography variant="body2"><strong>Chẩn đoán:</strong></Typography>
                                                {h.diagnoses.map((d) => (
                                                    <Chip key={d.id} label={`[${d.icdCode}] ${d.name}`} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                                                ))}
                                            </Box>
                                        )}
                                        {h.conclusion && <Typography variant="body2"><strong>Kết luận:</strong> {h.conclusion}</Typography>}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </TabPanel>
                </CardContent>
            </Card>

            {/* ── Add Service Dialog ── */}
            <Dialog open={svcDialogOpen} onClose={() => setSvcDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Thêm dịch vụ chỉ định</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth size="small" placeholder="Tìm tên dịch vụ..."
                        value={svcFilter} onChange={(e) => setSvcFilter(e.target.value)}
                        sx={{ mb: 1, mt: 1 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                    />
                    <Box sx={{ maxHeight: 240, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                        <List dense disablePadding>
                            {filteredSvcs.map((s) => (
                                <ListItemButton key={s.id} selected={selectedSvc?.id === s.id}
                                    onClick={() => setSelectedSvc(s)}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Radio size="small" checked={selectedSvc?.id === s.id} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={s.name}
                                        secondary={`${fmt(s.price)}${s.category ? `  ·  ${s.category}` : ''}`}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Button size="small" variant="outlined" onClick={() => setSvcQty(Math.max(1, svcQty - 1))}>−</Button>
                                <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{svcQty}</Typography>
                                <Button size="small" variant="outlined" onClick={() => setSvcQty(svcQty + 1)}>+</Button>
                            </Box>
                        </Grid>
                        <Grid item xs={8}>
                            {selectedSvc && (
                                <Typography>
                                    <strong>Thành tiền:</strong> {fmt(selectedSvc.price * svcQty)}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setSvcDialogOpen(false)} variant="outlined">Hủy</Button>
                    <Button onClick={handleAddService} variant="contained" disabled={!selectedSvc || addingSvc}>
                        {addingSvc ? 'Đang thêm...' : '✅ Thêm dịch vụ'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Add Diagnosis Dialog ── */}
            <Dialog open={diagDialogOpen} onClose={() => setDiagDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Thêm chẩn đoán</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth size="small" placeholder="Tìm mã ICD hoặc tên bệnh..."
                        value={diagFilter} onChange={(e) => setDiagFilter(e.target.value)}
                        sx={{ mb: 1, mt: 1 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                    />
                    <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                        <List dense disablePadding>
                            {filteredDiag.map((d) => (
                                <ListItemButton key={d.id} selected={selectedDiag?.id === d.id}
                                    onClick={() => setSelectedDiag(d)}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Radio size="small" checked={selectedDiag?.id === d.id} />
                                    </ListItemIcon>
                                    <ListItemText primary={`${d.icdCode} — ${d.name}`} secondary={d.category} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Loại chẩn đoán:</Typography>
                    <RadioGroup row value={diagType} onChange={(e) => setDiagType(e.target.value as any)}>
                        <FormControlLabel value="primary" control={<Radio />} label="🔴 Chẩn đoán chính" />
                        <FormControlLabel value="secondary" control={<Radio />} label="🟡 Chẩn đoán phụ" />
                    </RadioGroup>
                    <TextField
                        fullWidth size="small" label="Ghi chú thêm" placeholder="(tuỳ chọn)"
                        value={diagNote} onChange={(e) => setDiagNote(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDiagDialogOpen(false)} variant="outlined">Hủy</Button>
                    <Button onClick={handleAddDiagnosis} variant="contained" disabled={!selectedDiag || addingDiag}>
                        {addingDiag ? 'Đang thêm...' : '✅ Thêm chẩn đoán'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm deletes */}
            <ConfirmDialog open={!!deleteSvcId} message="Xoá dịch vụ này?" onConfirm={handleDeleteService} onClose={() => setDeleteSvcId(null)} />
            <ConfirmDialog open={!!deleteDiagId} message="Xoá chẩn đoán này?" onConfirm={handleDeleteDiagnosis} onClose={() => setDeleteDiagId(null)} />

            <BillModal open={billOpen} bill={bill} onClose={() => setBillOpen(false)} />
        </Box>
    );
}
