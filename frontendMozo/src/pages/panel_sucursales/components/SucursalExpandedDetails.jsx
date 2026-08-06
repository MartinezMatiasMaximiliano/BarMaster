import React from 'react';
import { Box, Divider, Stack } from '@mui/material';
import SucursalAlerts from './SucursalAlerts';
import SucursalCajaStatus from './SucursalCajaStatus';
import SucursalCharts from './SucursalCharts';
import TopProductosTable from './TopProductosTable';

const SucursalExpandedDetails = ({ sucursal, periodoDias }) => {
    return (
        <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 2 }} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <SucursalCajaStatus caja={sucursal.caja} />
                <SucursalAlerts kpis={sucursal.kpisPeriodo} periodoDias={periodoDias} />
            </Stack>

            <SucursalCharts series={sucursal.series} periodoDias={periodoDias} />
            <TopProductosTable productos={sucursal.topProductos} periodoDias={periodoDias} />
        </Box>
    );
};

export default SucursalExpandedDetails;
