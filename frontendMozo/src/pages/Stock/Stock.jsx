import { useEffect, useMemo, useState } from 'react';
import { Button, Chip, Container, Stack, Tooltip } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Tabla from '../../components/Tabla/Tabla';
import Filtros from '../../components/Filtros/Filtros';
import Ordenar from '../../components/Ordenar/Ordenar';
import { LoadingWrapper } from '../../components/common/LoadingWrapper';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useStock } from './hooks/useStock';
import StockDialog from './components/StockDialog';

const estadoStock = (fila) => {
    if (!fila.configurado) return { label: 'Sin configurar', color: 'warning' };
    if (!fila.controlaStock) return { label: 'Sin control', color: 'default' };
    if (fila.sinStock) return { label: 'Sin stock', color: 'error' };
    if (fila.stockBajo) return { label: 'Stock bajo', color: 'warning' };
    return { label: 'Disponible', color: 'success' };
};

const configuradosPrimero = (filas) => [...filas].sort(
    (a, b) => Number(b.configurado) - Number(a.configurado)
);

export default function Stock() {
    const { stock, cargando, error, cargar, guardarConfiguracion, registrarMovimiento } = useStock();
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [dialogo, setDialogo] = useState({ abierto: false, tipo: null, producto: null });

    const filasStock = useMemo(() => configuradosPrimero(stock.map((fila) => ({
        ...fila,
        ordenConfiguracion: fila.configurado ? 0 : 1,
        estado: estadoStock(fila).label,
    }))), [stock]);

    useEffect(() => {
        if (error) showSnackbar(error.message, 'error');
    }, [error, showSnackbar]);

    useEffect(() => {
        setFilasFiltradas(filasStock);
        setFilasOrdenadas(filasStock);
    }, [filasStock]);

    useEffect(() => {
        setFilasOrdenadas(configuradosPrimero(filasFiltradas));
    }, [filasFiltradas]);

    const abrirDialogo = (tipo, producto) => setDialogo({ abierto: true, tipo, producto });
    const cerrarDialogo = () => setDialogo({ abierto: false, tipo: null, producto: null });

    const guardar = async (valores) => {
        if (dialogo.tipo === 'configuracion') {
            await guardarConfiguracion(dialogo.producto, valores);
            showSnackbar('Configuración de stock actualizada.', 'success');
        } else {
            await registrarMovimiento(dialogo.producto, valores);
            showSnackbar('Movimiento de stock registrado.', 'success');
        }
    };

    const columnas = useMemo(() => [
        { key: 'codigoProducto', label: 'Código' },
        { key: 'nombreProducto', label: 'Producto' },
        {
            key: 'estado',
            label: 'Estado',
            render: (fila) => {
                const estado = estadoStock(fila);
                return <Chip label={estado.label} color={estado.color} size="small" />;
            },
        },
        { key: 'cantidadActual', label: 'Cantidad actual', align: 'right' },
        { key: 'cantidadMinima', label: 'Cantidad mínima', align: 'right' },
        {
            key: '__acciones',
            label: 'Acciones',
            align: 'right',
            render: (fila) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={fila.controlaStock ? 'Registrar ingreso o merma' : 'Activá el control de stock para cargar cantidades'}>
                        <span>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddBoxOutlinedIcon />}
                                onClick={() => abrirDialogo('movimiento', fila)}
                                disabled={!fila.configurado || !fila.controlaStock}
                            >
                                Cargar
                            </Button>
                        </span>
                    </Tooltip>
                    <Button
                        size="small"
                        startIcon={<SettingsOutlinedIcon />}
                        onClick={() => abrirDialogo('configuracion', fila)}
                    >
                        Configurar
                    </Button>
                </Stack>
            ),
        },
    ], []);

    const opcionesOrdenamiento = useMemo(() => ([
        { label: 'Configuración', campo: 'ordenConfiguracion', tipoOrden: 'numero' },
        { label: 'Código', campo: 'codigoProducto', tipoOrden: 'texto' },
        { label: 'Producto', campo: 'nombreProducto', tipoOrden: 'texto' },
        { label: 'Estado', campo: 'estado', tipoOrden: 'texto' },
        { label: 'Cantidad actual', campo: 'cantidadActual', tipoOrden: 'numero' },
        { label: 'Cantidad mínima', campo: 'cantidadMinima', tipoOrden: 'numero' },
    ]), []);

    const configuracionFiltros = useMemo(() => ({
        codigoProducto: { tipo: 'text' },
        nombreProducto: { tipo: 'text' },
        estado: { tipo: 'select' },
        cantidadActual: { tipo: 'number' },
        cantidadMinima: { tipo: 'number' },
    }), []);

    if (cargando) return <LoadingWrapper />;

    return (
        <Container>
            <Tabla
                titulo="Stock"
                filas={filasOrdenadas}
                columnas={columnas}
                onRefresh={cargar}
                mostrarExportacion={false}
                renderFiltros={() => (
                    <Filtros
                        filas={filasStock}
                        columnas={columnas}
                        configuracionFiltros={configuracionFiltros}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={opcionesOrdenamiento}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                getRowSx={(fila) => fila.stockBajo ? { bgcolor: 'warning.50' } : {}}
            />
            <StockDialog
                {...dialogo}
                onCerrar={cerrarDialogo}
                onGuardar={guardar}
            />
            <SnackbarComponent />
        </Container>
    );
}
