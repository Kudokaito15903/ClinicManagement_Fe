import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Table, TableBody, TableCell,
    TableHead, TableRow, Divider, Box, Chip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import type { Bill } from '@/types';

interface Props {
    open: boolean;
    bill: Bill | null;
    receiptUrl?: string;
    onClose: () => void;
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function BillModal({ open, bill, receiptUrl, onClose }: Props) {
    if (!bill) return null;

    const handlePrint = () => {
        if (receiptUrl) {
            window.open(receiptUrl, '_blank');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
                🧾 Phiếu Thu — Lần khám #{bill.visitId}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Bệnh nhân</Typography>
                        <Typography fontWeight={600}>{bill.patientName}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Ngày khám</Typography>
                        <Typography fontWeight={600}>{bill.visitDate}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Dịch vụ</TableCell>
                            <TableCell align="center">SL</TableCell>
                            <TableCell align="right">Đơn giá</TableCell>
                            <TableCell align="right">Thành tiền</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bill.services.map((s, i) => (
                            <TableRow key={i}>
                                <TableCell>{s.serviceName}</TableCell>
                                <TableCell align="center">{s.quantity}</TableCell>
                                <TableCell align="right">{fmt(s.unitPrice)}</TableCell>
                                <TableCell align="right">{fmt(s.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Phí khám</Typography>
                        <Typography fontWeight={500}>{fmt(bill.examinationFee)}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Tổng cộng</Typography>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                            {fmt(bill.totalAmount)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Chip label="Đã tính phí" color="success" size="small" />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined">Đóng</Button>
                {receiptUrl && (
                    <Button
                        onClick={handlePrint}
                        variant="contained"
                        startIcon={<PrintIcon />}
                    >
                        In phiếu thu
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
