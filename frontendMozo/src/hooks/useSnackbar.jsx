import { useState, useCallback } from 'react';
import { SnackbarWrapper } from '../components/common/SnackbarWrapper';

/**
 * Hook personalizado para manejar Snackbars de Material-UI
 * Retorna el estado del Snackbar, funciones para mostrarlo y un componente SnackbarWrapper
 * El SnackbarWrapper siempre tiene z-index alto para aparecer por encima de modales
 */
export const useSnackbar = () => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info' // 'success' | 'error' | 'warning' | 'info'
    });

    const showSnackbar = useCallback((message, severity = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    }, []);

    const closeSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // Componente SnackbarWrapper pre-configurado
    const SnackbarComponent = useCallback((props) => (
        <SnackbarWrapper
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={closeSnackbar}
            {...props}
        />
    ), [snackbar, closeSnackbar]);

    return {
        snackbar,
        showSnackbar,
        closeSnackbar,
        SnackbarComponent
    };
};
