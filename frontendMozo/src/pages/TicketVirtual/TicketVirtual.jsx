import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Divider, Stack,
    CircularProgress, Alert, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PersonIcon from '@mui/icons-material/Person';
import { ObtenerTicket } from '../../API/APITicket';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
});

function TicketVirtual() {
    const { tenant, id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        console.log("ID: ", id)
        setLoading(true);
        setError(null);

        ObtenerTicket(tenant, id)
            .then(data => setTicket(data))
            .catch(err => {
                console.error('Error al obtener ticket:', err);
                setError(err.response?.status === 404
                    ? 'Ticket no encontrado'
                    : 'Error al cargar el ticket. Intente nuevamente.'
                );
            })
            .finally(() => setLoading(false));
    }, [tenant, id]);

    // Agrupar productos por nombre para mostrar cantidad
    const productosAgrupados = useMemo(() => {
        if (!ticket?.productos) return [];

        const resumen = {};
        ticket.productos.forEach(p => {
            const nombre = p.nombre || p.Nombre;
            const precio = p.precio || p.Precio || p.precioDelMomento || p.PrecioDelMomento || 0;
            if (resumen[nombre]) {
                resumen[nombre].cantidad++;
                resumen[nombre].subtotal += precio;
            } else {
                resumen[nombre] = { nombre, precioUnitario: precio, cantidad: 1, subtotal: precio };
            }
        });

        return Object.values(resumen);
    }, [ticket?.productos]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
                <Alert severity="error" sx={{ maxWidth: 400 }}>{error}</Alert>
            </Box>
        );
    }

    if (!ticket) return null;

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            py: 4,
            px: 2
        }}>
            <Paper elevation={3} sx={{ maxWidth: 500, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{ bgcolor: 'success.main', color: 'white', px: 3, py: 2.5, textAlign: 'center' }}>
                    <ReceiptIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Ticket de Pago
                    </Typography>
                    {ticket.nombreSucursal && (
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
                            <StorefrontIcon sx={{ fontSize: '1rem' }} />
                            <Typography variant="body2">{ticket.nombreSucursal}</Typography>
                        </Stack>
                    )}
                </Box>

                <Box sx={{ px: 3, py: 2.5 }}>
                    {/* Info general */}
                    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                        {ticket.fechaMovimiento && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarTodayIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(ticket.fechaMovimiento).toLocaleString('es-AR', {
                                        dateStyle: 'long',
                                        timeStyle: 'short'
                                    })}
                                </Typography>
                            </Stack>
                        )}
                        {ticket.nombreMesa && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TableRestaurantIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Mesa: {ticket.nombreMesa}
                                </Typography>
                            </Stack>
                        )}
                        {ticket.nombreMozo && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PersonIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Atendido por: {ticket.nombreMozo}
                                </Typography>
                            </Stack>
                        )}
                        {ticket.tipoPago && (
                            <Typography variant="body2" color="text.secondary">
                                Forma de pago: {ticket.tipoPago}
                            </Typography>
                        )}
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Tabla de productos */}
                    {productosAgrupados.length > 0 && (
                        <TableContainer sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Cant.</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>P. Unit.</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {productosAgrupados.map((item) => (
                                        <TableRow key={item.nombre}>
                                            <TableCell>{item.nombre}</TableCell>
                                            <TableCell align="center">{item.cantidad}</TableCell>
                                            <TableCell align="right">{currencyFormatter.format(item.precioUnitario)}</TableCell>
                                            <TableCell align="right">{currencyFormatter.format(item.subtotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <Divider />

                    {/* Total */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {currencyFormatter.format(ticket.monto)}
                        </Typography>
                    </Stack>
                </Box>

                {/* Footer */}
                <Box sx={{ bgcolor: '#fafafa', px: 3, py: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        Ticket generado por BarMaster
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default TicketVirtual;
