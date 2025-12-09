import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
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
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                            gap: 2
                        }}
                    >
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
                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
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
                        </Box>
                    </Box>
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

