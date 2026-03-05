import { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Divider } from '@mui/material';
import type { Visit, Prescription } from '@/types';
import dayjs from 'dayjs';

interface Props {
    visit: Visit;
    prescription: Prescription;
}

const PrescriptionPrint = forwardRef<HTMLDivElement, Props>(({ visit, prescription }, ref) => {
    const patient = visit.patient;
    const age = patient?.dateOfBirth ? dayjs().diff(dayjs(patient.dateOfBirth), 'year') : null;

    return (
        <Box ref={ref} sx={{ p: 6, bgcolor: 'white', color: 'black', fontFamily: '"Times New Roman", Times, serif', fontSize: '13pt' }}>
            {/* INVISIBLE FONT LOADING HACK: ensures fonts are loaded before printing */}
            <Typography sx={{ display: 'none', fontFamily: '"Times New Roman", Times, serif' }}>1</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Phòng Khám Đa Khoa</Typography>
                    <Typography variant="body2">Địa chỉ: 123 Đường Công Nghệ, Hà Nội</Typography>
                    <Typography variant="body2">Điện thoại: 0123.456.789</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">Mã lượt khám: <strong>{visit.code || `#${visit.id}`}</strong></Typography>
                    <Typography variant="body2">Ngày SD: {dayjs().format('DD/MM/YYYY')}</Typography>
                </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4, mt: 4 }}>
                <Typography variant="h4" fontWeight={700}>ĐƠN THUỐC</Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ width: 150 }}><strong>Bệnh nhân:</strong></Typography>
                    <Typography sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{patient?.fullName}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', width: '50%' }}>
                        <Typography sx={{ width: 150 }}><strong>Ngày sinh:</strong></Typography>
                        <Typography>{patient?.dateOfBirth ? dayjs(patient.dateOfBirth).format('DD/MM/YYYY') : '—'} {age ? `(${age} tuổi)` : ''}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', width: '50%' }}>
                        <Typography sx={{ width: 80 }}><strong>Giới tính:</strong></Typography>
                        <Typography>{patient?.gender === 'Male' ? 'Nam' : patient?.gender === 'Female' ? 'Nữ' : 'Khác'}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ width: 150 }}><strong>Địa chỉ:</strong></Typography>
                    <Typography>{patient?.address || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ width: 150 }}><strong>Chẩn đoán:</strong></Typography>
                    <Typography>{visit.conclusion || '—'}</Typography>
                </Box>
            </Box>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, mt: 4 }}>Chỉ định dùng thuốc:</Typography>

            <Table size="small" sx={{ mb: 4, border: '1px solid black', '& th, & td': { border: '1px solid black', borderColor: 'black', color: 'black' } }}>
                <TableHead>
                    <TableRow>
                        <TableCell align="center" width="50px"><strong>STT</strong></TableCell>
                        <TableCell><strong>Tên thuốc, Hàm lượng</strong></TableCell>
                        <TableCell align="center" width="80px"><strong>ĐVT</strong></TableCell>
                        <TableCell align="center" width="80px"><strong>Số lượng</strong></TableCell>
                        <TableCell><strong>Cách dùng</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prescription.items.map((item, idx) => (
                        <TableRow key={item.id}>
                            <TableCell align="center">{idx + 1}</TableCell>
                            <TableCell>
                                <strong>{item.medicineName}</strong>
                                {item.dosageForm ? <Typography variant="caption" display="block">Dạng: {item.dosageForm}</Typography> : null}
                            </TableCell>
                            <TableCell align="center">{item.unit || 'Viên'}</TableCell>
                            <TableCell align="center"><strong>{item.quantity}</strong></TableCell>
                            <TableCell>{item.dosageInstruction}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {prescription.note && (
                <Box sx={{ mb: 4 }}>
                    <Typography><strong>Lời dặn của bác sĩ:</strong></Typography>
                    <Typography sx={{ whiteSpace: 'pre-line', fontStyle: 'italic', pl: 2, pt: 1 }}>{prescription.note}</Typography>
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                    <Typography><em>Ngày {dayjs().format('DD')} tháng {dayjs().format('MM')} năm {dayjs().format('YYYY')}</em></Typography>
                    <Typography sx={{ mt: 1, mb: 8 }}><strong>Bác sĩ khám bệnh</strong></Typography>
                    <Typography><strong>{visit.doctor?.name}</strong></Typography>
                </Box>
            </Box>
        </Box>
    );
});

export default PrescriptionPrint;
