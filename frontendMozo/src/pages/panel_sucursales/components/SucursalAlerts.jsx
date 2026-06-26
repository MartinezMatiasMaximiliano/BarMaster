import React from 'react';
import { Alert, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const SucursalAlerts = ({ kpis = {} }) => {
    if (kpis.rentabilidadIncompleta) {
        return (
            <Box sx={{ flex: 1 }}>
                <Alert
                    severity="warning"
                    icon={<WarningAmberIcon />}
                    sx={{ borderRadius: 1.5, height: '100%', alignItems: 'center' }}
                >
                    La rentabilidad es estimada porque hay productos vendidos sin costo de producción cargado.
                </Alert>
            </Box>
        );
    }

    if (Number(kpis.ventas || 0) === 0) {
        return (
            <Box sx={{ flex: 1 }}>
                <Alert severity="info" sx={{ borderRadius: 1.5, height: '100%', alignItems: 'center' }}>
                    Todavía no se registraron ventas hoy.
                </Alert>
            </Box>
        );
    }

    return <Box sx={{ flex: 1 }} />;
};

export default SucursalAlerts;
