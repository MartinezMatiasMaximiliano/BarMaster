import React from 'react';
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
import { InfoTipoMovimiento } from '../../../pages/MovimientoCaja/components/InfoTipoMovimiento';
import { calcularVuelto } from './movimientoCuentaCorrienteForm';
import { useMovimientoCuentaCorriente } from './useMovimientoCuentaCorriente';

function Modal_Movimiento_CuentaCorriente(props) {
    const { open, onClose, cuentaCorriente } = props;
    const {
        formData,
        errors,
        tiposMovimiento,
        tipoSeleccionado,
        balanceActual,
        esEgresoEfectivo,
        hayCajaActiva,
        loading,
        guardando,
        puedeGuardar,
        handleChange,
        handleSubmit
    } = useMovimientoCuentaCorriente(props);

    const moneda = balanceActual.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS'
    });
    const vuelto = calcularVuelto(formData);

    return (
        <Dialog open={open} onClose={guardando ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {cuentaCorriente?.nombre
                    ? `Registrar Movimiento - ${cuentaCorriente.nombre}`
                    : 'Registrar Movimiento'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {errors.general && <Alert severity="error">{errors.general}</Alert>}

                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <FormControl fullWidth required disabled={!hayCajaActiva || guardando}>
                                    <InputLabel>Tipo de Movimiento</InputLabel>
                                    <Select
                                        name="idTipoMovimientoCaja"
                                        value={formData.idTipoMovimientoCaja}
                                        onChange={handleChange}
                                        label="Tipo de Movimiento"
                                    >
                                        {tiposMovimiento.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <InfoTipoMovimiento tipo={tipoSeleccionado} />

                                <TextField
                                    label="Valor del movimiento"
                                    type="number"
                                    name="valorMovimiento"
                                    value={formData.valorMovimiento}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    disabled={!hayCajaActiva || guardando}
                                    inputProps={{
                                        min: 0.01,
                                        step: '0.01',
                                        inputMode: 'decimal',
                                        max: esEgresoEfectivo ? balanceActual : undefined
                                    }}
                                    error={!!errors.valorMovimiento}
                                    helperText={errors.valorMovimiento || (esEgresoEfectivo
                                        ? `Balance disponible: ${moneda}`
                                        : 'El valor debe ser mayor a 0')}
                                />

                                {tipoSeleccionado?.esEfectivo && (
                                    <TextField
                                        label="Monto abonado"
                                        type="number"
                                        name="montoAbonado"
                                        value={formData.montoAbonado}
                                        onChange={handleChange}
                                        placeholder={formData.valorMovimiento || ''}
                                        slotProps={{
                                            inputLabel: { shrink: true },
                                            formHelperText: vuelto !== null && !errors.montoAbonado
                                                ? { sx: { color: 'success.dark' } }
                                                : undefined
                                        }}
                                        fullWidth
                                        disabled={!hayCajaActiva || guardando}
                                        inputProps={{
                                            min: formData.valorMovimiento || 0.01,
                                            step: '0.01',
                                            inputMode: 'decimal'
                                        }}
                                        error={!!errors.montoAbonado}
                                        helperText={errors.montoAbonado || (vuelto !== null
                                            ? `Vuelto: ${vuelto.toLocaleString('es-AR', {
                                                style: 'currency',
                                                currency: 'ARS'
                                            })}`
                                            : 'Si no lo modificas, se enviará el valor del movimiento')}
                                    />
                                )}

                                <TextField
                                    label="Descripción"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={4}
                                    disabled={!hayCajaActiva || guardando}
                                    placeholder="Observaciones adicionales sobre el movimiento"
                                />

                                <DialogActions sx={{ px: 0, pb: 0 }}>
                                    <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
                                    <Button type="submit" variant="contained" disabled={guardando || !puedeGuardar}>
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
