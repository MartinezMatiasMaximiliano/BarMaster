import { memo, useMemo } from 'react';
import { Typography, Box, Stack, Accordion, AccordionSummary, AccordionDetails, Alert } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { formatearFecha } from '../Mesa/dateFormatter';
import { getNombre, getPrecio } from './helpers';

/** Agrupa productos por idMovimientoCaja y calcula resumen por ticket */
function useTicketsAgrupados(productos) {
    return useMemo(() => {
        const grupos = {};
        let totalGeneral = 0;

        productos.forEach(producto => {
            const clave = producto.idMovimientoCaja || producto.IdMovimientoCaja || 'sin-ticket';
            if (!grupos[clave]) grupos[clave] = [];
            grupos[clave].push(producto);
            totalGeneral += getPrecio(producto);
        });

        const tickets = Object.entries(grupos)
            .sort((a, b) => {
                const fechaA = a[1][0]?.fechaAgregado || '';
                const fechaB = b[1][0]?.fechaAgregado || '';
                return new Date(fechaA) - new Date(fechaB);
            })
            .map(([id, productos]) => {
                const resumen = {};
                let total = 0;

                productos.forEach(producto => {
                    const nombre = getNombre(producto);
                    const precio = getPrecio(producto);
                    if (resumen[nombre]) {
                        resumen[nombre].cantidad++;
                        resumen[nombre].total += precio;
                    } else {
                        resumen[nombre] = { precioUnitario: precio, cantidad: 1, total: precio };
                    }
                    total += precio;
                });

                const cantProductos = Object.values(resumen).reduce((sum, item) => sum + item.cantidad, 0);

                return {
                    id,
                    fechaAgregado: productos[0].fechaAgregado,
                    resumen,
                    total,
                    cantProductos
                };
            });

        return { tickets, totalGeneral };
    }, [productos]);
}

/** Accordion individual de un ticket de pago */
function TicketAccordion({ ticket, index, surfaceVariant = false }) {
    return (
        <Accordion
            disableGutters
            sx={{
                borderRadius: '8px !important',
                boxShadow: surfaceVariant ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                border: surfaceVariant ? 0 : '1px solid',
                borderColor: surfaceVariant ? 'transparent' : 'divider',
                bgcolor: surfaceVariant ? '#ffffff' : 'background.paper',
                '&:before': { display: 'none' },
                overflow: 'hidden',
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 2, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1, alignItems: 'center' } }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%', mr: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ReceiptIcon sx={{ fontSize: '0.95rem', color: 'success.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main', lineHeight: 1 }}>
                            Pago #{index + 1}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {formatearFecha(ticket.fechaAgregado)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {ticket.cantProductos} {ticket.cantProductos === 1 ? 'producto' : 'productos'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, ml: 'auto !important' }}>
                        ${ticket.total}
                    </Typography>
                </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: surfaceVariant ? 0.5 : 0, pb: 1.5 }}>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: surfaceVariant ? '#f7f9fc' : 'transparent', borderRadius: 1.5, p: surfaceVariant ? 1 : 0 }}>
                    {Object.entries(ticket.resumen).map(([nombre, data]) => (
                        <Box
                            key={nombre}
                            sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25, alignItems: 'center' }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                {data.cantidad}x {nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                                ${data.total}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

/** Lista de pagos registrados agrupados por ticket */
function ListaPagosRegistrados({ productos, surfaceVariant = false }) {
    const { tickets, totalGeneral } = useTicketsAgrupados(productos);

    return (
        <Box sx={surfaceVariant ? { display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', minHeight: 0 } : undefined}>
            <Stack
                spacing={1.5}
                sx={{
                    mb: surfaceVariant ? 0 : 2,
                    ...(surfaceVariant && {
                        flex: '1 1 auto',
                        minHeight: 0,
                        overflowY: 'auto',
                        bgcolor: '#f7f9fc',
                        borderRadius: 2,
                        p: 1.25
                    })
                }}
            >
                {tickets.map((ticket, index) => (
                    <TicketAccordion key={ticket.id} ticket={ticket} index={index} surfaceVariant={surfaceVariant} />
                ))}
            </Stack>
            <Alert severity="success" sx={surfaceVariant ? { flexShrink: 0, borderRadius: 2 } : undefined}>
                <b>Total</b>: ${totalGeneral}
            </Alert>
        </Box>
    );
}

export default memo(ListaPagosRegistrados);
