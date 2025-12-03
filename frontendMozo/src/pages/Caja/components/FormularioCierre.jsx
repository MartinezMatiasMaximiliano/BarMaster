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
    TextField,
    Typography
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { currencyFormatter } from '../utils/constants';

export const FormularioCierre = ({ formCierre, diferencia, guardando, onChange, onSubmit }) => {
    return (
        <Card variant="outlined">
            <CardHeader title="Cierre de caja" subheader="Detalla el monto final y observaciones." />
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
                            label="Fecha de cierre"
                            type="date"
                            name="fecha"
                            value={formCierre.fecha}
                            onChange={onChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            label="Hora de cierre"
                            type="time"
                            name="hora"
                            value={formCierre.hora}
                            onChange={onChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            label="Monto final real"
                            type="number"
                            name="montoFinal"
                            value={formCierre.montoFinal}
                            onChange={onChange}
                            fullWidth
                            inputProps={{ min: 0, step: '0.01' }}
                            required
                        />
                        <TextField
                            label="Observaciones"
                            name="observaciones"
                            value={formCierre.observaciones}
                            onChange={onChange}
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            placeholder="Diferencias, billetes faltantes, etc."
                        />
                    </Box>
                    <Stack spacing={1} mt={3}>
                        <Typography variant="body2" color="text.secondary">
                            Diferencia vs. esperado:{' '}
                            <strong
                                style={{
                                    color: diferencia === 0 ? 'inherit' : diferencia > 0 ? '#1b5e20' : '#b71c1c'
                                }}
                            >
                                {currencyFormatter.format(diferencia)}
                            </strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            startIcon={guardando ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                            disabled={guardando}
                        >
                            {guardando ? 'Cerrando...' : 'Cerrar caja'}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

