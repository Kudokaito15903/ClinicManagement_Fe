import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface Props {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    loading?: boolean;
}

export default function ConfirmDialog({ open, title = 'Xác nhận', message, onConfirm, onClose, loading }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: 'warning.main', display: 'flex' }}>
                    <WarningAmberIcon />
                </Box>
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">{message}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined" disabled={loading}>Huỷ</Button>
                <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
