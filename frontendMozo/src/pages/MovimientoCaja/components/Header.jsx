import React from 'react';
import { Box, Typography } from '@mui/material';

export const Header = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Nuevo Movimiento de Caja
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Registrá ingresos y egresos de la caja activa.
            </Typography>
        </Box>
    );
};

