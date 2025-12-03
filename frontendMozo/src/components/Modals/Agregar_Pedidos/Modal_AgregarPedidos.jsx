import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Stack,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAgregarPedidos } from './hooks/useAgregarPedidos';
import { FiltrosProductos } from './components/FiltrosProductos';
import { ListaProductos } from './components/ListaProductos';
import { Carrito } from './components/Carrito';
import { LoadingWrapper } from '../../common/LoadingWrapper';

function Modal_AgregarPedidos({ open, onClose, numeroMesa }) {
    const {
        productos,
        categorias,
        productosFiltrados,
        carrito,
        busqueda,
        categoriaFiltro,
        loading,
        totalCarrito,
        totalItems,
        setBusqueda,
        setCategoriaFiltro,
        agregarAlCarrito,
        actualizarCantidad,
        actualizarIndicaciones,
        handleEnviarPedidos,
        limpiarEstado
    } = useAgregarPedidos(open, numeroMesa, onClose);

    const handleClose = () => {
        limpiarEstado();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            disableEnforceFocus
            PaperProps={{
                sx: { height: '90vh' }
            }}
        >
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        Agregar Pedidos - Mesa {numeroMesa}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                    {/* Columna izquierda: Productos - 65% */}
                    <Box sx={{ width: '65%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Stack spacing={2} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <FiltrosProductos
                                productos={productos}
                                categorias={categorias}
                                busqueda={busqueda}
                                categoriaFiltro={categoriaFiltro}
                                onBusquedaChange={setBusqueda}
                                onCategoriaChange={setCategoriaFiltro}
                            />

                            <LoadingWrapper minHeight={400}>
                                <ListaProductos
                                    productos={productosFiltrados}
                                    onAgregarProducto={agregarAlCarrito}
                                />
                            </LoadingWrapper>
                        </Stack>
                    </Box>

                    {/* Columna derecha: Carrito - 35% */}
                    <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column' }}>
                        <Carrito
                            carrito={carrito}
                            totalCarrito={totalCarrito}
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
                    onClick={handleEnviarPedidos}
                    variant="contained"
                    color="primary"
                    disabled={carrito.length === 0 || loading}
                    startIcon={<ShoppingCartIcon />}
                >
                    {loading 
                        ? 'Enviando...' 
                        : `Agregar ${totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''}` : 'Pedidos'}`
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default Modal_AgregarPedidos;

