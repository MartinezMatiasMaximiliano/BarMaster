import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    Stack
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const FormularioApertura = ({ guardando, onSubmit }) => {
    return (
        <Card variant="outlined">
            <CardHeader
                title="Apertura de caja"
                subheader="El monto inicial se toma automáticamente del cierre de la última caja."
            />
            <Divider />
            <CardContent>
                <Box component="form" onSubmit={onSubmit}>
                    <Stack direction="row" justifyContent="center">
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

