import { useState } from 'react';
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
import { CrearDeliveryTakeawayFromComanda } from '../../../API/APIDeliveryTakeaway';
import { useSnackbar } from '../../../hooks/useSnackbar';

const tiposDeEnvio = [
    { id: 1, nombre: 'Corto', precio: 500 },
    { id: 2, nombre: 'Mediano', precio: 750 },
    { id: 3, nombre: 'Largo', precio: 1000 },
];

export default function Modal_AgregarDelivery({ open, onClose, onSuccess, origen = 'Delivery' }) {
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        Cliente: '',
        Direccion: '',
        Telefono: '',
        Indicaciones: '',
        TipoEnvio: '',
    });

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
    } = useComandaProductos(open);

    const handleClose = () => {
        setFormValues({ Cliente: '', Direccion: '', Telefono: '', Indicaciones: '', TipoEnvio: '' });
        limpiarComanda();
        onClose();
    };

    const handleFormChange = (field) => (e) => {
        setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleEnviar = async () => {
        const { Cliente, Telefono } = formValues;
        if (!Cliente?.trim()) {
            showSnackbar('Ingresá el nombre del cliente.', 'warning');
            return;
        }
        if (!Telefono?.trim()) {
            showSnackbar('Ingresá el teléfono del cliente.', 'warning');
            return;
        }
        if (comanda.length === 0) {
            showSnackbar('Agregá al menos un producto a la comanda.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const result = await CrearDeliveryTakeawayFromComanda(formValues, comanda, origen);
            const label = origen === 'Takeaway' ? 'Take Away' : 'Delivery';
            if (result) {
                showSnackbar(`${label} creado correctamente.`, 'success');
                handleClose();
                onSuccess?.();
            } else {
                showSnackbar(`Error al crear el ${label.toLowerCase()}. Intentá de nuevo.`, 'error');
            }
        } catch (error) {
            const label = origen === 'Takeaway' ? 'take away' : 'delivery';
            const raw = error.response?.data?.message ?? error.response?.data;
            const msg = typeof raw === 'string' ? raw : `Error al crear el ${label}. Intente nuevamente.`;
            showSnackbar(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

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
                    <Typography variant="h6">{origen === 'Takeaway' ? 'Nuevo Take Away' : 'Nuevo Delivery'}</Typography>
                    <IconButton aria-label="close" onClick={handleClose} sx={{ color: (t) => t.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {/* Datos del cliente y envío */}
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
                            required
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
                                <MenuItem value="">—</MenuItem>
                                {tiposDeEnvio.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.nombre} ($ {t.precio})
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Stack>
                </Stack>

                {/* Título sección productos */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Productos — hacé clic en un producto para agregarlo a la comanda
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
                    {loading
                        ? 'Creando...'
                        : `Crear ${origen === 'Takeaway' ? 'take away' : 'delivery'}${totalItems > 0 ? ` (${totalItems} item${totalItems !== 1 ? 's' : ''})` : ''}`
                    }
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
