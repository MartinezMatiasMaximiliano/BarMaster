import React from 'react';
import { Box, Divider, Stack } from '@mui/material';
import SucursalAlerts from './SucursalAlerts';
import SucursalCajaStatus from './SucursalCajaStatus';
import SucursalCharts from './SucursalCharts';
import TopProductosTable from './TopProductosTable';

const SucursalExpandedDetails = ({ sucursal }) => {
    return (
        <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 2 }} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <SucursalCajaStatus caja={sucursal.caja} />
                <SucursalAlerts kpis={sucursal.kpisHoy} />
            </Stack>

            <SucursalCharts series={sucursal.series} />
            <TopProductosTable productos={sucursal.topProductos} />
        </Box>
    );
};

export default SucursalExpandedDetails;
