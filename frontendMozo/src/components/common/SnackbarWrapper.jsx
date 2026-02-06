import { Snackbar, Alert } from '@mui/material';

/**
 * Componente Snackbar wrapper que siempre tiene z-index alto
 * para aparecer por encima de los modales
 */
export const SnackbarWrapper = ({ 
    open, 
    message, 
    severity = 'info', 
    onClose, 
    autoHideDuration = 6000,
    anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
    ...otherProps 
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={anchorOrigin}
            sx={{ zIndex: 1500 }}
            {...otherProps}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};
