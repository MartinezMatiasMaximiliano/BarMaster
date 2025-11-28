import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    TextField
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const FormularioApertura = ({ formApertura, guardando, onChange, onSubmit }) => {
    return (
        <Card variant="outlined">
            <CardHeader
                title="Apertura de caja"
                subheader="Ingresa la fecha, horario y monto inicial disponible."
            />
            <Divider />
            <CardContent>
                <Box component="form" onSubmit={onSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Fecha de apertura"
                                type="date"
                                name="fecha"
                                value={formApertura.fecha}
                                onChange={onChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Hora de apertura"
                                type="time"
                                name="hora"
                                value={formApertura.hora}
                                onChange={onChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Monto inicial"
                                type="number"
                                name="montoInicial"
                                value={formApertura.montoInicial}
                                onChange={onChange}
                                fullWidth
                                inputProps={{ min: 0, step: '0.01' }}
                                required
                            />
                        </Grid>
                    </Grid>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={guardando ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />}
                            disabled={guardando}
                        >
                            {guardando ? 'Abriendo...' : 'Abrir caja'}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

