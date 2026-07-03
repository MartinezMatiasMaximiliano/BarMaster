import { Alert, Box, Stack, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { FiltrosProductos } from '../../Modals/Agregar_Pedidos/components/FiltrosProductos';
import { ListaProductos } from '../../Modals/Agregar_Pedidos/components/ListaProductos';
import { LoadingWrapper } from '../../common/LoadingWrapper';

export const MesaProductosPanel = ({
    idVisita,
    productos,
    categorias,
    productosFiltrados,
    busqueda,
    categoriaFiltro,
    onBusquedaChange,
    onCategoriaChange,
    onAgregarProducto
}) => (
    <Box sx={{ minHeight: 0, bgcolor: '#fbfcfe', borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <AddShoppingCartIcon color="success" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Agregar productos
                </Typography>
            </Stack>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', px: 2, pb: 2, pt: 1 }}>
            {!idVisita ? (
                <Alert severity="warning">
                    No se encontró una visita activa para agregar productos a esta mesa.
                </Alert>
            ) : (
                <Box sx={{ height: '100%', minWidth: 0, overflow: 'hidden' }}>
                    <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Stack spacing={2} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <FiltrosProductos
                                productos={productos}
                                categorias={categorias}
                                busqueda={busqueda}
                                categoriaFiltro={categoriaFiltro}
                                onBusquedaChange={onBusquedaChange}
                                onCategoriaChange={onCategoriaChange}
                            />

                            <LoadingWrapper minHeight={320}>
                                <ListaProductos
                                    productos={productosFiltrados}
                                    onAgregarProducto={onAgregarProducto}
                                />
                            </LoadingWrapper>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    </Box>
);
