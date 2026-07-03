import React from 'react';
import {
    Box,
    Card,
    Chip,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PercentIcon from '@mui/icons-material/Percent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import KpiTile from './KpiTile';
import SucursalExpandedDetails from './SucursalExpandedDetails';
import { formatearMoneda, formatearNumero, formatearPorcentaje } from '../utils/formatters';

const SucursalPerformanceCard = ({ sucursal, expanded, onToggle }) => {
    const kpis = sucursal.kpisPeriodo ?? {};
    const caja = sucursal.caja ?? {};
    const ventas = Number(kpis.ventas || 0);
    const margen = Number(kpis.margenEstimado || 0);

    return (
        <Card
            variant="outlined"
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                borderColor: expanded ? 'primary.main' : 'divider',
                boxShadow: expanded ? '0 8px 24px rgba(25, 118, 210, 0.12)' : 'none',
                transition: 'border-color 160ms ease, box-shadow 160ms ease'
            }}
        >
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0
                            }}
                        >
                            <StorefrontIcon />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                                {sucursal.nombre || sucursal.direccion || 'Sucursal'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                                {sucursal.direccion || 'Sin dirección cargada'}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <Chip
                                    size="small"
                                    color={caja.abierta ? 'success' : 'error'}
                                    icon={<AccountBalanceWalletIcon />}
                                    label={caja.abierta ? 'Caja abierta' : 'Caja cerrada'}
                                />
                                {kpis.rentabilidadIncompleta && (
                                    <Chip size="small" color="warning" label="Margen estimado" />
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                        <Tooltip title={expanded ? 'Ocultar detalle' : 'Ver detalle'}>
                            <IconButton onClick={onToggle} color={expanded ? 'primary' : 'default'}>
                                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Box
                    onClick={onToggle}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
                        gap: 1.5,
                        cursor: 'pointer'
                    }}
                >
                    <KpiTile
                        icon={<AttachMoneyIcon fontSize="small" color="primary" />}
                        label="Ventas período"
                        value={formatearMoneda(ventas)}
                        helper={ventas > 0 ? 'Facturación del período' : 'Sin ventas registradas'}
                    />
                    <KpiTile
                        icon={<ShoppingCartIcon fontSize="small" color="primary" />}
                        label="Pedidos"
                        value={formatearNumero(kpis.cantidadVisitas)}
                        helper="Visitas del período"
                    />
                    <KpiTile
                        icon={<ReceiptLongIcon fontSize="small" color="primary" />}
                        label="Ticket prom."
                        value={formatearMoneda(kpis.ticketPromedio)}
                    />
                    <KpiTile
                        icon={<PercentIcon fontSize="small" color={margen >= 0 ? 'success' : 'error'} />}
                        label="Margen"
                        value={formatearMoneda(margen)}
                        helper={formatearPorcentaje(kpis.margenPorcentaje)}
                        color={margen >= 0 ? 'success.main' : 'error.main'}
                    />
                    <KpiTile
                        icon={<AccountBalanceWalletIcon fontSize="small" color={caja.abierta ? 'success' : 'error'} />}
                        label="Caja"
                        value={caja.abierta ? formatearMoneda(caja.montoActual) : 'Cerrada'}
                        helper={caja.abierta ? 'Monto actual' : 'Revisar apertura'}
                    />
                </Box>

                {expanded && <SucursalExpandedDetails sucursal={sucursal} />}
            </Stack>
        </Card>
    );
};

export default SucursalPerformanceCard;
