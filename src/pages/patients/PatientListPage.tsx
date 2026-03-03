import { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Button, TextField, InputAdornment,
    Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Chip, Tooltip, Avatar,
    Skeleton, alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getPatients, deletePatient } from '@/api/patients';
import type { Patient } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';

const genderLabel = (g?: string) => g === 'Male' ? 'Nam' : g === 'Female' ? 'Nữ' : 'Khác';
const genderColor = (g?: string) => g === 'Male' ? 'info' : g === 'Female' ? 'secondary' : 'default';

export default function PatientListPage() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = useCallback((kw?: string) => {
        setLoading(true);
        getPatients(kw || undefined)
            .then(setPatients)
            .catch(() => enqueueSnackbar('Không thể tải danh sách bệnh nhân', { variant: 'error' }))
            .finally(() => setLoading(false));
    }, [enqueueSnackbar]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = () => fetchData(keyword);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deletePatient(deleteId);
            enqueueSnackbar('Đã xoá bệnh nhân thành công', { variant: 'success' });
            setDeleteId(null);
            fetchData(keyword);
        } catch {
            enqueueSnackbar('Xoá thất bại', { variant: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Bệnh nhân</Typography>
                    <Typography color="text.secondary" variant="body2">Quản lý danh sách bệnh nhân</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/patients/new')}
                    sx={{ borderRadius: '10px', px: 3 }}
                >
                    Thêm bệnh nhân
                </Button>
            </Box>

            {/* Search */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm theo tên bệnh nhân..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                        <Button variant="contained" onClick={handleSearch} sx={{ px: 3, borderRadius: '10px', whiteSpace: 'nowrap' }}>
                            Tìm kiếm
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>{[1, 2, 3].map((k) => <Skeleton key={k} height={52} sx={{ mb: 1 }} />)}</Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Bệnh nhân</TableCell>
                                        <TableCell>Mã BN</TableCell>
                                        <TableCell>Năm sinh</TableCell>
                                        <TableCell>Giới tính</TableCell>
                                        <TableCell>Địa chỉ</TableCell>
                                        <TableCell align="right">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {patients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                    <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                                    <Typography>Không có bệnh nhân nào</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : patients.map((p) => (
                                        <TableRow
                                            key={p.id}
                                            hover
                                            sx={{ '&:hover': { bgcolor: alpha('#2563eb', 0.03) }, cursor: 'pointer' }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                                        {p.fullName.charAt(0)}
                                                    </Avatar>
                                                    <Typography fontWeight={500}>{p.fullName}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell><Chip label={p.code} size="small" variant="outlined" /></TableCell>
                                            <TableCell>{p.birthYear ?? '—'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={genderLabel(p.gender)}
                                                    size="small"
                                                    color={genderColor(p.gender) as 'info' | 'secondary' | 'default'}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.address ?? '—'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton size="small" color="primary" onClick={() => navigate(`/patients/${p.id}`)}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sửa">
                                                    <IconButton size="small" color="info" onClick={() => navigate(`/patients/${p.id}/edit`)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xoá">
                                                    <IconButton size="small" color="error" onClick={() => setDeleteId(p.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={!!deleteId}
                message="Bạn có chắc muốn xoá bệnh nhân này? Hành động này không thể hoàn tác."
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
                loading={deleting}
            />
        </Box>
    );
}
