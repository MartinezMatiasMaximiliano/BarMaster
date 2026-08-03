import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    Box,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSelector } from 'react-redux';
import { BuscarTipoMovimientosPorEntorno } from '../../../API/APITipoMovimientosCaja';
import { boxCardBorder } from '../../../styles/boxStyles';
import { cancelButtonStyles, dialogTitleGradientStyles, dialogActionsStyles } from '../../../styles/buttonStyles';

/**
 * Modal para facturar con método de pago, efectivo/vuelto, cuenta corriente (placeholder) y descuento.
 * Backend aún no recibe estos datos; el formulario queda listo para cuando se implemente.
 */
export default function Modal_Facturar({
    open,
    onClose,
    titulo,
    total,
    productIds,
    currencyFormatter,
    onConfirm
}) {
    const [tiposPago, setTiposPago] = useState([]);
    const [idTipoPago, setIdTipoPago] = useState('');
    const [montoRecibido, setMontoRecibido] = useState('');
    const [idCuentaCorriente, setIdCuentaCorriente] = useState('');
    const [montoDescuento, setMontoDescuento] = useState('');
    const [descripcionDescuento, setDescripcionDescuento] = useState('');
    const [facturarTicket, setFacturarTicket] = useState(false);
    const [showOpcionesExtra, setShowOpcionesExtra] = useState(false);
    const [error, setError] = useState('');
    const cajaActiva = useSelector((state) => state.cajaActiva.value);
    const montoCaja = cajaActiva?.montoActual ?? null;

    const tipoPagoSeleccionado = tiposPago.find(t => String(t.id) === String(idTipoPago));
    const esEfectivo = tipoPagoSeleccionado?.esEfectivo === true;
    const totalNum = Number(total) || 0;
    const descuentoNum = Math.min(Number(montoDescuento) || 0, totalNum);
    const totalFinal = Math.max(0, totalNum - descuentoNum);
    const montoRecibidoNum = Number(montoRecibido) || 0;
    const vuelto = esEfectivo && montoRecibidoNum >= totalFinal ? montoRecibidoNum - totalFinal : null;
    const cajaInsuficiente = vuelto !== null && vuelto > 0 && montoCaja !== null && vuelto > montoCaja;

    const cargarTiposPago = useCallback(async () => {
        try {
            const data = await BuscarTipoMovimientosPorEntorno('Ventas');
            const raw = Array.isArray(data)
                ? data
                : (data?.data && Array.isArray(data.data) ? data.data : []);
            const lista = raw.map((t) => ({
                id: t.id ?? t.Id,
                nombre: (t.nombre ?? t.Nombre ?? '').toString().trim(),
                esEfectivo: t.esEfectivo ?? t.EsEfectivo ?? false,
            })).filter((t) => t.id != null && t.nombre !== '');
            setTiposPago(lista);
        } catch (e) {
            console.error('Error al cargar tipos de pago:', e);
            setTiposPago([]);
        }
    }, []);

    useEffect(() => {
        if (open) {
            cargarTiposPago();
            setIdTipoPago('');
            setMontoRecibido('');
            setIdCuentaCorriente('');
            setMontoDescuento('');
            setDescripcionDescuento('');
            setFacturarTicket(false);
            setShowOpcionesExtra(false);
            setError('');
        }
    }, [open, cargarTiposPago]);

    useEffect(() => {
        if (open && tiposPago.length > 0 && !idTipoPago) {
            setIdTipoPago(String(tiposPago[0].id));
        }
    }, [open, tiposPago, idTipoPago]);

    const handleClose = useCallback(() => {
        setError('');
        onClose();
    }, [onClose]);

    const handleConfirm = useCallback(() => {
        if (esEfectivo && (montoRecibido === '' || isNaN(montoRecibidoNum))) {
            setError('Ingrese el monto recibido en efectivo.');
            return;
        }
        if (esEfectivo && montoRecibidoNum < totalFinal) {
            setError('El monto recibido no puede ser menor al total a pagar.');
            return;
        }
        if (cajaInsuficiente) {
            setError(`La caja no tiene suficiente efectivo para dar el vuelto. Disponible: ${currencyFormatter.format(montoCaja)}`);
            return;
        }
        setError('');
        const montoParaBackend = esEfectivo ? montoRecibidoNum : totalFinal;
        onConfirm(productIds, Number(idTipoPago), montoParaBackend);
        handleClose();
    }, [esEfectivo, montoRecibidoNum, totalFinal, montoRecibido, cajaInsuficiente, montoCaja, currencyFormatter, productIds, idTipoPago, onConfirm, handleClose]);

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={dialogTitleGradientStyles}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ReceiptIcon color="primary" />
                        <Typography variant="h6" component="span">{titulo}</Typography>
                    </Stack>
                    <IconButton aria-label="cerrar" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 0.5 }}>
                    <Box sx={{ ...boxCardBorder, p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Total a pagar</Typography>
                        <Typography variant="h5" color="primary.main">{currencyFormatter.format(totalNum)}</Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <FormControl size="small" sx={{ width: { xs: '100%', sm: '65%' } }}>
                            <InputLabel id="facturar-tipo-pago">Método de pago</InputLabel>
                            <Select
                                labelId="facturar-tipo-pago"
                                value={idTipoPago}
                                label="Método de pago"
                                onChange={(e) => setIdTipoPago(e.target.value)}
                            >
                                {tiposPago.map((tp) => (
                                    <MenuItem key={tp.id} value={String(tp.id)}>{tp.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            sx={{ width: { xs: '100%', sm: '35%' }, m: 0 }}
                            control={
                                <Checkbox
                                    checked={facturarTicket}
                                    onChange={(e) => setFacturarTicket(e.target.checked)}
                                />
                            }
                            label="Facturar ticket"
                        />
                    </Stack>

                    {esEfectivo && (
                        <Box>
                            <TextField
                                fullWidth
                                size="small"
                                label="Monto con el que paga"
                                type="number"
                                inputProps={{ min: 0, step: 0.01 }}
                                value={montoRecibido}
                                onChange={(e) => setMontoRecibido(e.target.value)}
                                error={(montoRecibido !== '' && montoRecibidoNum < totalFinal) || cajaInsuficiente}
                                helperText={cajaInsuficiente ? `La caja no tiene suficiente efectivo (disponible: ${currencyFormatter.format(montoCaja)})` : ''}
                            />
                            {vuelto !== null && vuelto >= 0 && (
                                <Typography variant="body2" color={cajaInsuficiente ? 'error.main' : 'success.main'} sx={{ mt: 0.5, fontWeight: 600 }}>
                                    Vuelto: {currencyFormatter.format(vuelto)}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={showOpcionesExtra ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setShowOpcionesExtra(prev => !prev)}
                        sx={{
                            color: 'text.secondary',
                            borderColor: 'divider',
                            opacity: 0.9,
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: 'action.hover',
                                bgcolor: 'action.hover',
                                opacity: 1
                            }
                        }}
                    >
                        {showOpcionesExtra ? 'Ocultar opciones extra' : 'Mostrar opciones extra'}
                    </Button>

                    {showOpcionesExtra && (
                        <Stack spacing={2}>
                            <Box sx={{ ...boxCardBorder, p: 2 }}>
                                <Typography variant="subtitle1" color="text.primary" sx={{ mb: 1.5, fontWeight: 600 }}>
                                    Cargar a cuenta corriente
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="facturar-cuenta-corriente">Seleccionar</InputLabel>
                                    <Select
                                        labelId="facturar-cuenta-corriente"
                                        value={idCuentaCorriente}
                                        label="Seleccionar"
                                        onChange={(e) => setIdCuentaCorriente(e.target.value)}
                                    >
                                        <MenuItem value="">No cargar a cuenta</MenuItem>
                                        <MenuItem value="proximamente" disabled>Cuenta corriente (próximamente)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ ...boxCardBorder, p: 2 }}>
                                <Typography variant="subtitle1" color="text.primary" sx={{ mb: 1.5, fontWeight: 600 }}>
                                    Aplicar descuento
                                </Typography>
                                <Stack spacing={1.5}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Monto del descuento"
                                        type="number"
                                        inputProps={{ min: 0, max: totalNum, step: 0.01 }}
                                        value={montoDescuento}
                                        onChange={(e) => setMontoDescuento(e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Descripción del descuento"
                                        value={descripcionDescuento}
                                        onChange={(e) => setDescripcionDescuento(e.target.value)}
                                        placeholder="Ej: Promoción, cliente habitual..."
                                    />
                                </Stack>
                                {descuentoNum > 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Total con descuento: <strong>{currencyFormatter.format(totalFinal)}</strong>
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    )}

                    {error && (
                        <Typography variant="body2" color="error">{error}</Typography>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={dialogActionsStyles}>
                <Button variant="outlined" color="secondary" onClick={handleClose} sx={cancelButtonStyles}>
                    Cancelar
                </Button>
                <Button variant="contained" color="success" onClick={handleConfirm} startIcon={<ReceiptIcon />}>
                    Confirmar facturación
                </Button>
            </DialogActions>
        </Dialog>
    );
}
