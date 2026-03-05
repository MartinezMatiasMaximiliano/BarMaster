import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Stack } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

export default function FiltroFechas({ onBuscar, onHistorico, loading = false }) {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const prevFechasRef = useRef({ fechaInicio: '', fechaFin: '' });

    useEffect(() => {
        const prev = prevFechasRef.current;
        if (fechaInicio && fechaFin && (prev.fechaInicio !== fechaInicio || prev.fechaFin !== fechaFin)) {
            prevFechasRef.current = { fechaInicio, fechaFin };
            onBuscar(fechaInicio, fechaFin);
        }
    }, [fechaInicio, fechaFin]);

    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                    size="small"
                    label="Fecha Inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 170 }}
                    disabled={loading}
                />
                <TextField
                    size="small"
                    label="Fecha Fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 170 }}
                    disabled={loading}
                />
                <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={onHistorico}
                    disabled={loading}
                    size="medium"
                >
                    Histórico
                </Button>
            </Stack>
        </Box>
    );
}
