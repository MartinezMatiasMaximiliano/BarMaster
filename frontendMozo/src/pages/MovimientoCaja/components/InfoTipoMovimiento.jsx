import React from 'react';
import { Box, Typography } from '@mui/material';

export const InfoTipoMovimiento = ({ tipo }) => {
    if (!tipo) return null;

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap'
            }}
        >
            <Typography variant="body2">
                <strong>Tipo:</strong> {tipo.esIngreso ? 'Ingreso' : 'Egreso'}
            </Typography>
            <Typography variant="body2">
                <strong>Forma de pago:</strong> {tipo.esEfectivo ? 'Efectivo' : 'No Efectivo'}
            </Typography>
        </Box>
    );
};

