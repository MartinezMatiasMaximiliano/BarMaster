import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Stack,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { formatearFecha, formatearMoneda } from '../utils/formatters';

/**
 * Componente de diálogo que muestra el plan y el desglose de facturación
 */
const PlanDialog = ({ 
    open, 
    onClose, 
    datosFacturacion, 
    desgloseFacturacion, 
    totalCalculado 
}) => {
    const handleScrollToDetail = () => {
        const detalleElement = document.getElementById('detalle-facturacion');
        if (detalleElement) {
            detalleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    fontWeight: 600,
                    pb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <AccountBalanceWalletIcon color="primary" />
                    <Typography variant="h6">Mi Plan - Resumen de Facturación</Typography>
                </Stack>
                <Button
                    onClick={onClose}
                    size="small"
                    sx={{ minWidth: 'auto', p: 1 }}
                >
                    <CloseIcon />
                </Button>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Resumen principal */}
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'primary.light',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        }}
                    >
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    Período
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {datosFacturacion.periodo}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={3} flexWrap="wrap">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                        Total a Pagar
                                    </Typography>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                        onClick={handleScrollToDetail}
                                    >
                                        ${formatearMoneda(datosFacturacion.totalPagar)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                        Vencimiento
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CalendarTodayIcon fontSize="small" color="primary" />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {formatearFecha(datosFacturacion.fechaVencimiento)}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Detalle de facturación */}
                    <Box id="detalle-facturacion">
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Detalle de Facturación por Sucursal
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Precio</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {desgloseFacturacion.map((sucursal, index) => (
                                        <React.Fragment key={index}>
                                            {sucursal.items.map((item, itemIndex) => (
                                                <TableRow 
                                                    key={itemIndex}
                                                    sx={{
                                                        '&:last-child td': { borderBottom: itemIndex === sucursal.items.length - 1 ? '2px solid' : 'none' },
                                                        '&:last-child td:last-child': { borderBottom: itemIndex === sucursal.items.length - 1 ? '2px solid' : 'none' }
                                                    }}
                                                >
                                                    {itemIndex === 0 && (
                                                        <TableCell 
                                                            rowSpan={sucursal.items.length}
                                                            sx={{ 
                                                                fontWeight: 600,
                                                                verticalAlign: 'top',
                                                                pt: itemIndex === 0 ? 2 : 'auto'
                                                            }}
                                                        >
                                                            {sucursal.sucursal}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>{item.concepto}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={item.tipo} 
                                                            size="small" 
                                                            color={item.tipo === 'Plan' ? 'primary' : 'secondary'}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                        ${formatearMoneda(item.precio)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                                                    Subtotal {sucursal.sucursal}:
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                    ${formatearMoneda(sucursal.subtotal)}
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                    <TableRow sx={{ bgcolor: 'primary.main', color: 'white' }}>
                                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            TOTAL:
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            ${formatearMoneda(totalCalculado)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PlanDialog;

