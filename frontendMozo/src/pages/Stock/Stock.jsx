import { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Button, Stack, Tooltip } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Tabla from '../../components/Tabla/Tabla';
import Filtros from '../../components/Filtros/Filtros';
import Ordenar from '../../components/Ordenar/Ordenar';
import { LoadingWrapper } from '../../components/common/LoadingWrapper';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useStock } from './hooks/useStock';
import StockDialog from './components/StockDialog';
import MovimientosStockDrawer from './components/MovimientosStockDrawer';

const GRUPOS_STOCK = [
    {
        key: 'critico',
        label: 'Stock bajo o sin stock',
    },
    {
        key: 'suficiente',
        label: 'Stock suficiente',
    },
    {
        key: 'sinSeguimiento',
        label: 'Sin seguimiento de stock',
    },
];

const obtenerGrupoStock = (fila) => {
    if (fila.configurado && fila.controlaStock && (fila.sinStock || fila.stockBajo)) {
        return 'critico';
    }
    if (fila.configurado && fila.controlaStock) {
        return 'suficiente';
    }
    return 'sinSeguimiento';
};

const agruparPorPrioridad = (filas) => GRUPOS_STOCK.flatMap(
    (grupo) => filas.filter((fila) => obtenerGrupoStock(fila) === grupo.key)
);

const obtenerClaveGrupoStock = (fila) => fila.grupoStock;

export default function Stock() {
    const { stock, cargando, error, cargar, guardarConfiguracion, registrarMovimiento } = useStock();
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [dialogo, setDialogo] = useState({ abierto: false, tipo: null, producto: null });
    const [productoMovimientos, setProductoMovimientos] = useState(null);

    const filasStock = useMemo(() => agruparPorPrioridad(stock.map((fila) => ({
        ...fila,
        grupoStock: obtenerGrupoStock(fila),
    }))), [stock]);

    useEffect(() => {
        if (error) showSnackbar(error.message, 'error');
    }, [error, showSnackbar]);

    useEffect(() => {
        setFilasFiltradas(filasStock);
        setFilasOrdenadas(filasStock);
    }, [filasStock]);

    useEffect(() => {
        setFilasOrdenadas(agruparPorPrioridad(filasFiltradas));
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
        { key: 'cantidadActual', label: 'Cantidad actual', align: 'right' },
        { key: 'cantidadMinima', label: 'Cantidad mínima', align: 'right' },
        {
            key: '__movimientos',
            label: 'Movimientos',
            align: 'right',
            filtrable: false,
            render: (fila) => (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setProductoMovimientos(fila)}
                >
                    Ver
                </Button>
            ),
        },
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
        { label: 'Producto', campo: 'nombreProducto', tipoOrden: 'texto' },
        { label: 'Código', campo: 'codigoProducto', tipoOrden: 'texto' },
        { label: 'Cantidad actual', campo: 'cantidadActual', tipoOrden: 'numero' },
        { label: 'Cantidad mínima', campo: 'cantidadMinima', tipoOrden: 'numero' },
    ]), []);

    const configuracionFiltros = useMemo(() => ({
        codigoProducto: { tipo: 'text' },
        nombreProducto: { tipo: 'text' },
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
                paginacion={false}
                maxHeightTabla={{ xs: '60vh', md: 600 }}
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
                        onOrdenar={(filas) => setFilasOrdenadas(agruparPorPrioridad(filas))}
                    />
                )}
                grupos={GRUPOS_STOCK}
                getGrupoFila={obtenerClaveGrupoStock}
            />
            <StockDialog
                {...dialogo}
                onCerrar={cerrarDialogo}
                onGuardar={guardar}
            />
            <MovimientosStockDrawer
                open={Boolean(productoMovimientos)}
                producto={productoMovimientos}
                onClose={() => setProductoMovimientos(null)}
            />
            <SnackbarComponent />
        </Container>
    );
}