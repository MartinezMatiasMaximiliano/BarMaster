import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField
} from '@mui/material';
import { ObtenerCajaActiva } from '../../API/APICaja';
import { ObtenerTiposMovimientoCaja } from '../../API/APIMovimientosCaja';
import { CrearMovimientoCuentaCorriente } from '../../API/APICuentasCorrientes';
import { obtenerMensajeError } from '../../pages/Caja/utils/constants';
import { InfoTipoMovimiento } from '../../pages/MovimientoCaja/components/InfoTipoMovimiento';

const initialFormData = {
    idTipoMovimientoCaja: '',
    monto: '',
    descripcion: ''
};

function Modal_Movimiento_CuentaCorriente({ open, onClose, cuentaCorriente, onSuccess }) {
    const [formData, setFormData] = useState(initialFormData);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [cajaActiva, setCajaActiva] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setError('');
            return;
        }

        const cargarDatos = async () => {
            setLoading(true);
            setError('');
            try {
                const [tipos, caja] = await Promise.all([
                    ObtenerTiposMovimientoCaja('CuentaCorriente'),
                    ObtenerCajaActiva()
                ]);

                setTiposMovimiento(Array.isArray(tipos) ? tipos : []);
                setCajaActiva(caja);

                if (!caja) {
                    setError('No hay una caja abierta. Debes abrir una caja primero desde el Arqueo de Caja.');
                }
            } catch (err) {
                setError(obtenerMensajeError(err, 'No pudimos cargar los datos para registrar el movimiento.'));
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [open]);

    const tipoSeleccionado = useMemo(
        () => tiposMovimiento.find((tipo) => tipo.id === Number(formData.idTipoMovimientoCaja)),
        [tiposMovimiento, formData.idTipoMovimientoCaja]
    );

    const balanceActual = cajaActiva?.montoActual ?? 0;
    const esEgresoEfectivo = tipoSeleccionado?.esEfectivo && !tipoSeleccionado?.esIngreso;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!formData.idTipoMovimientoCaja) {
            setError('Debes seleccionar un tipo de movimiento.');
            return;
        }

        if (!formData.monto || Number(formData.monto) <= 0) {
            setError('El monto debe ser mayor a 0.');
            return;
        }

        if (!cajaActiva?.id) {
            setError('No hay una caja abierta. Debes abrir una caja primero.');
            return;
        }

        if (esEgresoEfectivo && Number(formData.monto) > balanceActual) {
            setError(`No puedes registrar un egreso mayor al balance actual de la caja (${balanceActual.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}).`);
            return;
        }

        setGuardando(true);
        try {
            await CrearMovimientoCuentaCorriente(cuentaCorriente.id, formData);
            await onSuccess?.();
            onClose();
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos registrar el movimiento de la cuenta corriente.'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open={open} onClose={guardando ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {cuentaCorriente?.nombre
                    ? `Registrar Movimiento - ${cuentaCorriente.nombre}`
                    : 'Registrar Movimiento'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <FormControl fullWidth required disabled={!cajaActiva || guardando}>
                                    <InputLabel>Tipo de Movimiento</InputLabel>
                                    <Select
                                        name="idTipoMovimientoCaja"
                                        value={formData.idTipoMovimientoCaja}
                                        onChange={handleChange}
                                        label="Tipo de Movimiento"
                                    >
                                        {tiposMovimiento.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <InfoTipoMovimiento tipo={tipoSeleccionado} />

                                <TextField
                                    label="Monto"
                                    type="number"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    disabled={!cajaActiva || guardando}
                                    inputProps={{
                                        min: 0.01,
                                        step: '0.01',
                                        max: esEgresoEfectivo ? balanceActual : undefined
                                    }}
                                    helperText={
                                        esEgresoEfectivo
                                            ? `Balance disponible: ${balanceActual.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
                                            : 'El monto debe ser mayor a 0'
                                    }
                                />

                                <TextField
                                    label="Descripción"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={4}
                                    disabled={!cajaActiva || guardando}
                                    placeholder="Observaciones adicionales sobre el movimiento"
                                />

                                <DialogActions sx={{ px: 0, pb: 0 }}>
                                    <Button onClick={onClose} disabled={guardando}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" variant="contained" disabled={guardando || !cajaActiva}>
                                        {guardando ? 'Registrando...' : 'Registrar Movimiento'}
                                    </Button>
                                </DialogActions>
                            </Stack>
                        </form>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

export default Modal_Movimiento_CuentaCorriente;
