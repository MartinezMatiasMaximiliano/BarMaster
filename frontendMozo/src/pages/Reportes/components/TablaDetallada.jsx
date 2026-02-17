import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Paper,
    Pagination,
    Tooltip,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { formatearMoneda, formatearFechaHora } from '../utils/formatters';

const tooltipText = { color: 'rgba(255, 255, 255, 0.95)' };
const tooltipSecondary = { color: 'rgba(255, 255, 255, 0.75)' };

const ContenidoProductosVisita = ({ visita, formatearMonedaFn }) => {
    const productos = visita?.productos ?? [];
    if (productos.length === 0) {
        return <Typography variant="body2" sx={tooltipText}>Sin productos</Typography>;
    }
    return (
        <List dense disablePadding sx={{ maxHeight: 320, overflow: 'auto', minWidth: 260, color: 'white' }}>
            <Typography variant="subtitle2" sx={{ ...tooltipText, opacity: 0.95, mb: 0.5 }}>
                Productos de la visita
            </Typography>
            {productos.map((p, idx) => {
                const nombre = p.nombreProducto ?? p.nombre ?? '—';
                const qty = p.cantidad ?? p.Cantidad ?? 1;
                const total = p.precioTotal ?? p.precio ?? p.Precio ?? 0;
                return (
                    <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                        <ListItemText
                            primary={`${qty} × ${nombre}`}
                            secondary={formatearMonedaFn(total)}
                            primaryTypographyProps={{ variant: 'body2', sx: tooltipText }}
                            secondaryTypographyProps={{ variant: 'caption', sx: tooltipSecondary }}
                        />
                    </ListItem>
                );
            })}
        </List>
    );
};

const TablaDetallada = ({ visitas, tipoReporte }) => {
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('fechaHora');
    const [order, setOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedVisitas = [...visitas].sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];

        if (orderBy === 'fechaHora') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const filteredVisitas = sortedVisitas.filter(visita => {
        const searchLower = searchTerm.toLowerCase();
        return (
            visita.numeroMesa?.toLowerCase().includes(searchLower) ||
            visita.estado?.toLowerCase().includes(searchLower) ||
            visita.total?.toString().includes(searchTerm)
        );
    });

    const paginatedVisitas = filteredVisitas.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Detalle de Visitas
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        sx={{ width: 300 }}
                    />
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'fechaHora'}
                                        direction={orderBy === 'fechaHora' ? order : 'asc'}
                                        onClick={() => handleSort('fechaHora')}
                                    >
                                        Fecha y Hora
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'mesa'}
                                        direction={orderBy === 'mesa' ? order : 'asc'}
                                        onClick={() => handleSort('mesa')}
                                    >
                                        Mesa
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Productos</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'total'}
                                        direction={orderBy === 'total' ? order : 'asc'}
                                        onClick={() => handleSort('total')}
                                    >
                                        Total
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'estado'}
                                        direction={orderBy === 'estado' ? order : 'asc'}
                                        onClick={() => handleSort('estado')}
                                    >
                                        Estado
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Tipo de Pago</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedVisitas.map((visita) => (
                                <TableRow key={visita.id}>
                                    <TableCell>{formatearFechaHora(visita.fechaHora)}</TableCell>
                                    <TableCell>{visita.numeroMesa || 'N/A'}</TableCell>
                                    <TableCell sx={{ cursor: 'default' }}>
                                        <Tooltip
                                            title={<ContenidoProductosVisita visita={visita} formatearMonedaFn={formatearMoneda} />}
                                            enterDelay={400}
                                            leaveDelay={100}
                                            placement="right-start"
                                            slotProps={{
                                                popper: { sx: { maxWidth: 380 } }
                                            }}
                                        >
                                            <Box component="span" sx={{ display: 'inline-block', cursor: 'help' }}>
                                                {visita.productos?.length || 0} producto(s)
                                            </Box>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{formatearMoneda(visita.total || 0)}</TableCell>
                                    <TableCell>{visita.estado || 'N/A'}</TableCell>
                                    <TableCell>
                                        {visita.pagos?.map(p => p.idTipoPago).join(', ') || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                        count={Math.ceil(filteredVisitas.length / rowsPerPage)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default TablaDetallada;

