import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BuscarMovimientosStock } from '../../../API/APIStock';
import Tabla from '../../../components/Tabla/Tabla';
import { formatearFecha } from '../../../Helpers/HelperFunctions';
import IdTruncado from '../../../components/common/IdTruncado';

const ETIQUETAS_CANAL = {
    Manual: 'Manual',
    Local: 'Venta local',
    Delivery: 'Venta delivery',
    Takeaway: 'Venta takeaway',
};

const mapearMovimiento = (movimiento) => ({
    id: movimiento.id,
    fecha: movimiento.fecha,
    tipo: movimiento.tipo,
    canal: ETIQUETAS_CANAL[movimiento.canal] ?? movimiento.canal ?? '-',
    idVisita: movimiento.idVisita || null,
    mesa: movimiento.nombreMesa || '-',
    mozo: movimiento.canal === 'Local'
        ? movimiento.nombreMozo || '-'
        : '-',
    cantidad: Number(movimiento.cantidad ?? 0),
    stockAnterior: Number(movimiento.stockAnterior ?? 0),
    stockPosterior: Number(movimiento.stockPosterior ?? 0),
    motivo: movimiento.motivo || '-',
});

export default function MovimientosStockDrawer({ open, producto, onClose }) {
    const [movimientos, setMovimientos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || !producto?.idProducto) return undefined;

        let ignorar = false;

        const cargar = async () => {
            setCargando(true);
            setError('');
            setMovimientos([]);

            try {
                const respuesta = await BuscarMovimientosStock(producto.idProducto);
                if (!ignorar) {
                    setMovimientos((Array.isArray(respuesta) ? respuesta : []).map(mapearMovimiento));
                }
            } catch (err) {
                if (!ignorar) {
                    setError(err?.message || 'No pudimos cargar los movimientos de stock.');
                }
            } finally {
                if (!ignorar) setCargando(false);
            }
        };

        cargar();

        return () => {
            ignorar = true;
        };
    }, [open, producto?.idProducto]);

    const columnas = useMemo(() => [
        {
            key: 'fecha',
            label: 'Fecha',
            render: (fila) => (fila.fecha ? formatearFecha(fila.fecha) : '-'),
        },
        { key: 'tipo', label: 'Tipo' },
        { key: 'canal', label: 'Canal' },
        {
            key: 'idVisita',
            label: 'Id visita',
            render: (fila) => <IdTruncado value={fila.idVisita} />,
        },
        { key: 'mesa', label: 'Mesa' },
        { key: 'mozo', label: 'Mozo' },
        {
            key: 'cantidad',
            label: 'Cantidad',
            align: 'right',
            render: (fila) => (fila.cantidad > 0 ? `+${fila.cantidad}` : fila.cantidad),
        },
        { key: 'stockAnterior', label: 'Stock anterior', align: 'right' },
        { key: 'stockPosterior', label: 'Stock posterior', align: 'right' },
        { key: 'motivo', label: 'Motivo' },
    ], []);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', lg: 'min(75vw, 1200px)' },
                    height: '100%',
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography variant="h6">Movimientos de stock</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {producto?.nombreProducto || 'Producto'}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} aria-label="Cerrar movimientos de stock">
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <Divider />
                <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {cargando ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
                            <CircularProgress />
                        </Stack>
                    ) : !error ? (
                        <Tabla
                            titulo="Historial"
                            filas={movimientos}
                            columnas={columnas}
                            rowsPerPage={12}
                            mostrarExportacion={false}
                            minHeightContenido="auto"
                            ajustarAlturaAlContenido={true}
                        />
                    ) : null}
                </Box>
            </Box>
        </Drawer>
    );
}
