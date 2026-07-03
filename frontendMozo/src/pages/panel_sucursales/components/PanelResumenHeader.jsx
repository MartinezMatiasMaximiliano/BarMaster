import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatearMoneda } from '../utils/formatters';
import { periodosPanelSucursales } from '../utils/dateRange';

const resumenItems = (totales, totalSucursales) => [
    ['Ventas período', formatearMoneda(totales.ventasPeriodo)],
    ['Pedidos período', totales.visitasPeriodo.toLocaleString('es-AR')],
    ['Margen período', formatearMoneda(totales.margenPeriodo)],
    ['Cajas abiertas', `${totales.cajasAbiertas}/${totalSucursales}`]
];

const PanelResumenHeader = ({
    empresaNombre,
    periodoDias,
    totalSucursales,
    totales,
    onPeriodoChange,
    onActualizar
}) => {
    return (
        <Box
            sx={{
                mb: 3,
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}
        >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {empresaNombre || 'Resumen de sucursales'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vista rápida de ventas, caja y rentabilidad operativa.
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                            Período
                        </Typography>
                        {periodosPanelSucursales.map(periodo => (
                            <Button
                                key={periodo.dias}
                                variant={periodoDias === periodo.dias ? 'contained' : 'outlined'}
                                onClick={() => onPeriodoChange(periodo.dias)}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                            >
                                {periodo.label}
                            </Button>
                        ))}
                    </Stack>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={onActualizar}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                    >
                        Actualizar
                    </Button>
                </Stack>
            </Stack>

            <Box
                sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                    gap: 1.5
                }}
            >
                {resumenItems(totales, totalSucursales).map(([label, value]) => (
                    <Box key={label} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                            {label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                            {value}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default PanelResumenHeader;
