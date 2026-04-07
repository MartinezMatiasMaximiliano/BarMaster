import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Stack,
    Box,
    TextField,
    MenuItem
} from '@mui/material';
import { SnackbarWrapper } from '../../common/SnackbarWrapper';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useComandaProductos } from './hooks/useComandaProductos';
import { FiltrosProductos } from '../Agregar_Pedidos/components/FiltrosProductos';
import { ListaProductos } from '../Agregar_Pedidos/components/ListaProductos';
import { Comanda } from '../Agregar_Pedidos/components/Comanda';
import { CrearDeliveryTakeawayFromComanda, ModificarDeliveryTakeaway } from '../../../API/APIDeliveryTakeaway';
import { BuscarTodosLosTipoEnvios } from '../../../API/APITipoEnvios';
import { useSnackbar } from '../../../hooks/useSnackbar';

function construirComandaInicial(initialData) {
    const productos = Array.isArray(initialData?.productos) ? initialData.productos : [];
    const agrupados = new Map();

    productos.forEach((producto) => {
        const idProducto = producto.idProducto ?? producto.id;
        const indicaciones = producto.indicaciones ?? '';
        const key = `${idProducto}-${indicaciones}`;
        const existente = agrupados.get(key);

        if (existente) {
            existente.cantidad += 1;
            return;
        }

        agrupados.set(key, {
            producto: {
                id: idProducto,
                nombre: producto.nombre ?? '-',
                precio: Number(producto.precio ?? 0),
                imagenUrl: producto.imagenUrl ?? null,
            },
            cantidad: 1,
            indicaciones,
        });
    });

    return Array.from(agrupados.values());
}

const formInicial = {
    Cliente: '',
    Direccion: '',
    Telefono: '',
    Indicaciones: '',
    TipoEnvio: '',
};

export default function Modal_AgregarDelivery({
    open,
    onClose,
    onSuccess,
    origen = 'Delivery',
    modo = 'crear',
    initialData = null,
}) {
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const esEdicion = modo === 'editar';
    const [loading, setLoading] = useState(false);
    const [tiposDeEnvio, setTiposDeEnvio] = useState([]);
    const [formValues, setFormValues] = useState(formInicial);

    const {
        productos,
        categorias,
        productosFiltrados,
        comanda,
        busqueda,
        categoriaFiltro,
        totalComanda,
        totalItems,
        setBusqueda,
        setCategoriaFiltro,
        agregarAComanda,
        actualizarCantidad,
        actualizarIndicaciones,
        limpiarComanda,
        setComanda,
    } = useComandaProductos(open);

    const handleClose = () => {
        setFormValues(formInicial);
        limpiarComanda();
        onClose();
    };

    const handleFormChange = (field) => (e) => {
        setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

    useEffect(() => {
        let cancelled = false;

        if (!open || origen !== 'Delivery') {
            return () => { cancelled = true; };
        }

        BuscarTodosLosTipoEnvios()
            .then((data) => {
                if (!cancelled) {
                    setTiposDeEnvio(Array.isArray(data) ? data : []);
                }
            })
            .catch((error) => {
                console.error('Error al cargar tipos de envío:', error);
                if (!cancelled) {
                    setTiposDeEnvio([]);
                }
            });

        return () => { cancelled = true; };
    }, [open, origen]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (!esEdicion || !initialData) {
            setFormValues(formInicial);
            setComanda([]);
            return;
        }

        setFormValues({
            Cliente: initialData.cliente ?? '',
            Direccion: initialData.direccion ?? '',
            Telefono: initialData.telefono ?? '',
            Indicaciones: initialData.indicaciones ?? '',
            TipoEnvio: initialData.idTipoEnvio ?? '',
        });
        setComanda(construirComandaInicial(initialData));
    }, [open, esEdicion, initialData, setComanda]);

    const handleEnviar = async () => {
        const { Cliente, Direccion, TipoEnvio } = formValues;
        if (!Cliente?.trim()) {
            showSnackbar('Ingresá el nombre del cliente.', 'warning');
            return;
        }
        if (origen === 'Delivery' && !Direccion?.trim()) {
            showSnackbar('Ingresá la dirección del delivery.', 'warning');
            return;
        }
        if (origen === 'Delivery' && (TipoEnvio === '' || TipoEnvio == null)) {
            showSnackbar('Seleccioná un tipo de envío.', 'warning');
            return;
        }
        if (origen === 'Delivery' && tiposDeEnvio.length === 0) {
            showSnackbar('No hay tipos de envío disponibles. Cargalos desde el ABM primero.', 'warning');
            return;
        }
        if (comanda.length === 0) {
            showSnackbar('Agregá al menos un producto a la comanda.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const result = esEdicion
                ? await ModificarDeliveryTakeaway({
                    id: initialData?.id,
                    idVisita: initialData?.idVisita,
                    productosOriginales: initialData?.productos ?? [],
                    ...formValues,
                    comanda,
                })
                : await CrearDeliveryTakeawayFromComanda(formValues, comanda, origen);

            const label = origen === 'Takeaway' ? 'Take Away' : 'Delivery';
            if (result) {
                showSnackbar(`${label} ${esEdicion ? 'modificado' : 'creado'} correctamente.`, 'success');
                handleClose();
                onSuccess?.();
            } else {
                showSnackbar(`Error al ${esEdicion ? 'modificar' : 'crear'} el ${label.toLowerCase()}. Intentá de nuevo.`, 'error');
            }
        } catch (error) {
            const label = origen === 'Takeaway' ? 'take away' : 'delivery';
            const raw = error.response?.data?.message ?? error.response?.data;
            const esErrorPersistencia = typeof raw === 'string'
                && raw.includes('An error occurred while saving the entity changes');

            let msg = typeof raw === 'string'
                ? raw
                : `Error al ${esEdicion ? 'modificar' : 'crear'} el ${label}. Intente nuevamente.`;

            if (esErrorPersistencia && origen === 'Delivery') {
                msg = `No se pudo ${esEdicion ? 'modificar' : 'crear'} el delivery. Verificá que el tipo de envío exista en la base de datos de BackEndAPI y que la dirección esté completa.`;
            }

            showSnackbar(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const titulo = esEdicion
        ? (origen === 'Takeaway' ? 'Editar Take Away' : 'Editar Delivery')
        : (origen === 'Takeaway' ? 'Nuevo Take Away' : 'Nuevo Delivery');

    const textoBoton = loading
        ? (esEdicion ? 'Guardando...' : 'Creando...')
        : `${esEdicion ? 'Guardar cambios' : `Crear ${origen === 'Takeaway' ? 'take away' : 'delivery'}`}${totalItems > 0 ? ` (${totalItems} item${totalItems !== 1 ? 's' : ''})` : ''}`;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            disableEnforceFocus
            PaperProps={{ sx: { height: '90vh' } }}
        >
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{titulo}</Typography>
                    <IconButton aria-label="close" onClick={handleClose} sx={{ color: (t) => t.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Datos del pedido</Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                        <TextField
                            label="Cliente"
                            value={formValues.Cliente}
                            onChange={handleFormChange('Cliente')}
                            variant="outlined"
                            size="small"
                            required
                            sx={{ minWidth: 180 }}
                        />
                        {origen === 'Delivery' && (
                            <TextField
                                label="Dirección"
                                value={formValues.Direccion}
                                onChange={handleFormChange('Direccion')}
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 220 }}
                            />
                        )}
                        <TextField
                            label="Teléfono"
                            value={formValues.Telefono}
                            onChange={handleFormChange('Telefono')}
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 140 }}
                        />
                        <TextField
                            label="Indicaciones"
                            value={formValues.Indicaciones}
                            onChange={handleFormChange('Indicaciones')}
                            variant="outlined"
                            size="small"
                            placeholder={origen === 'Takeaway' ? 'Ej: Retirar en 30 min...' : 'Ej: Timbre A, dejar en portón...'}
                            sx={{ minWidth: 200 }}
                        />
                        {origen === 'Delivery' && (
                            <TextField
                                select
                                label="Tipo de envío"
                                value={formValues.TipoEnvio}
                                onChange={handleFormChange('TipoEnvio')}
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 160 }}
                            >
                                <MenuItem value="">-</MenuItem>
                                {tiposDeEnvio.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.nombre} ($ {Number(t.precio ?? 0)})
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Stack>
                </Stack>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Productos - hacé clic en un producto para agregarlo a la comanda
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, minWidth: 0, overflow: 'hidden', flex: 1 }}>
                    <Box sx={{ width: '65%', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Stack spacing={2} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <FiltrosProductos
                                productos={productos}
                                categorias={categorias}
                                busqueda={busqueda}
                                categoriaFiltro={categoriaFiltro}
                                onBusquedaChange={setBusqueda}
                                onCategoriaChange={setCategoriaFiltro}
                            />
                            <ListaProductos
                                productos={productosFiltrados}
                                onAgregarProducto={agregarAComanda}
                            />
                        </Stack>
                    </Box>
                    <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column' }}>
                        <Comanda
                            comanda={comanda}
                            totalComanda={totalComanda}
                            onActualizarCantidad={actualizarCantidad}
                            onActualizarIndicaciones={actualizarIndicaciones}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={handleEnviar}
                    variant="contained"
                    color="primary"
                    disabled={comanda.length === 0 || loading}
                    startIcon={<ShoppingCartIcon />}
                >
                    {textoBoton}
                </Button>
            </DialogActions>

            <SnackbarWrapper
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
        </Dialog>
    );
}
