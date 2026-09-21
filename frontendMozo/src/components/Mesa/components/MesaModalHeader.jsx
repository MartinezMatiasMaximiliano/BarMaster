import { DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';

export const MesaModalHeader = ({ fecha, numeroMesa, onClose }) => (
    <DialogTitle sx={{
        bgcolor: (theme) => theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.background.paper,
        px: 3,
        py: 2
    }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon color="action" />
                    <Typography variant="h6" color="text.secondary" component="span">
                        {fecha}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <TableRestaurantIcon color="primary" />
                    <Typography variant="h6" component="span">
                        Mesa {numeroMesa}
                    </Typography>
                </Stack>
            </Stack>
            <IconButton aria-label="close" onClick={onClose} sx={{ color: theme => theme.palette.grey[500] }}>
                <CloseIcon />
            </IconButton>
        </Stack>
    </DialogTitle>
);
