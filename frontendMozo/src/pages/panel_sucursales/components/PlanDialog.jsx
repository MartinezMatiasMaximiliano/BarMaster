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
import CloseIcon from '@mui/icons-material/Close';
import { formatearMoneda } from '../utils/formatters';

const PlanDialog = ({
    open,
    onClose,
    desgloseFacturacion,
    totalCalculado
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{
                fontWeight: 600,
                pb: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <AccountBalanceWalletIcon color="primary" />
                    <Typography variant="h6">Mi Plan</Typography>
                </Stack>
                <Button onClick={onClose} size="small" sx={{ minWidth: 'auto', p: 0.5, color: 'text.secondary' }}>
                    <CloseIcon fontSize="small" />
                </Button>
            </DialogTitle>

            <DialogContent dividers>
                {desgloseFacturacion.length > 0 ? (
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                            Detalle de facturación por sucursal
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
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
                                                <TableRow key={itemIndex}>
                                                    {itemIndex === 0 && (
                                                        <TableCell
                                                            rowSpan={sucursal.items.length}
                                                            sx={{ fontWeight: 600, verticalAlign: 'top', pt: 1.5 }}
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
                                                    <TableCell align="right">${formatearMoneda(item.precio)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                                                    Subtotal:
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                    ${formatearMoneda(sucursal.subtotal)}
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                    <TableRow sx={{ bgcolor: 'primary.dark' }}>
                                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '1rem', color: 'grey.50' }}>
                                            TOTAL:
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem', color: 'grey.50' }}>
                                            ${formatearMoneda(totalCalculado)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No hay información de facturación disponible.
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PlanDialog;
