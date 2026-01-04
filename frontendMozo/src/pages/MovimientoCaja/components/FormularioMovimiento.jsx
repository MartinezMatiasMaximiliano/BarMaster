import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TIPOS_MOVIMIENTO_CAJA } from '../../../API/APIMovimientosCaja';
import { InfoTipoMovimiento } from './InfoTipoMovimiento';

export const FormularioMovimiento = ({
    formData,
    cajaActiva,
    guardando,
    tipoSeleccionado,
    onChange,
    onSubmit
}) => {
    return (
        <Card variant="outlined">
            <CardHeader
                title="Registrar Movimiento"
                subheader={
                    cajaActiva
                        ? `Caja activa desde ${cajaActiva.fechaApertura ?? cajaActiva.fecha} ${cajaActiva.horaApertura ?? ''}`
                        : 'No hay caja activa'
                }
            />
            <Divider />
            <CardContent>
                {!cajaActiva && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        No hay una caja abierta. Debes abrir una caja primero desde el{' '}
                        <strong>Arqueo de Caja</strong>.
                    </Alert>
                )}

                <Box component="form" onSubmit={onSubmit}>
                    <Stack spacing={3}>
                        <FormControl fullWidth required disabled={!cajaActiva}>
                            <InputLabel>Tipo de Movimiento</InputLabel>
                            <Select
                                name="idTipoMovimientoCaja"
                                value={formData.idTipoMovimientoCaja}
                                onChange={onChange}
                                label="Tipo de Movimiento"
                            >
                                {TIPOS_MOVIMIENTO_CAJA.map((tipo) => (
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
                            onChange={onChange}
                            fullWidth
                            required
                            disabled={!cajaActiva}
                            inputProps={{ min: 0.01, step: '0.01' }}
                            helperText="El monto debe ser mayor a 0"
                        />

                        <TextField
                            label="Descripción"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={onChange}
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={4}
                            disabled={!cajaActiva}
                            placeholder="Observaciones adicionales sobre el movimiento (opcional)"
                        />

                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={
                                    guardando ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <AddIcon />
                                    )
                                }
                                disabled={guardando || !cajaActiva}
                            >
                                {guardando ? 'Registrando...' : 'Registrar Movimiento'}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

