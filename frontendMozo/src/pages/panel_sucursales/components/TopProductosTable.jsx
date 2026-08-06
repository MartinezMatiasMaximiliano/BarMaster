import React from 'react';
import {
    Box,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { formatearMoneda } from '../utils/formatters';
import { obtenerPeriodoPanel } from '../utils/dateRange';

const TopProductosTable = ({ productos = [], periodoDias }) => {
    const maxVentas = Math.max(...productos.map(p => Number(p.ventas || 0)), 0);
    const periodo = obtenerPeriodoPanel(periodoDias);

    return (
        <Box
            sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ p: 1.5, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Top productos {periodo.fraseDe}
                </Typography>
            </Box>

            {productos.length > 0 ? (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="right">Cant.</TableCell>
                            <TableCell align="right">Ventas</TableCell>
                            <TableCell align="right">Margen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productos.map((producto) => (
                            <TableRow key={producto.nombre}>
                                <TableCell sx={{ minWidth: 180 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {producto.nombre}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={maxVentas > 0 ? (Number(producto.ventas || 0) / maxVentas) * 100 : 0}
                                        sx={{ mt: 0.75, height: 5, borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell align="right">{producto.cantidad}</TableCell>
                                <TableCell align="right">{formatearMoneda(producto.ventas)}</TableCell>
                                <TableCell align="right">{formatearMoneda(producto.margenEstimado)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No hay productos vendidos {periodo.fraseEn}.
                </Typography>
            )}
        </Box>
    );
};

export default TopProductosTable;
