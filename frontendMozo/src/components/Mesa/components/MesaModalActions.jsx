import { Box, Button, DialogActions } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export const MesaModalActions = ({
    puedeFacturarTodo,
    productosSeleccionadosCount,
    puedeAgregarPedidos,
    loading,
    totalItems,
    onFacturarTodo,
    onFacturarPartes,
    onAgregarPedidos,
    onClose
}) => (
    <DialogActions sx={{ px: 3, py: 2, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
                variant="contained"
                color="success"
                onClick={onFacturarTodo}
                disabled={!puedeFacturarTodo}
                startIcon={<ReceiptIcon />}
                size="small"
            >
                Facturar todo
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={onFacturarPartes}
                disabled={productosSeleccionadosCount === 0}
                startIcon={<PlaylistAddCheckIcon />}
                size="small"
            >
                Facturar por partes {productosSeleccionadosCount > 0 && `(${productosSeleccionadosCount})`}
            </Button>
            <Button
                onClick={onAgregarPedidos}
                variant="contained"
                color="success"
                disabled={!puedeAgregarPedidos}
                startIcon={<ShoppingCartIcon />}
                size="small"
            >
                {loading ? 'Enviando...' : `Agregar ${totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''}` : 'Pedidos'}`}
            </Button>
        </Box>
        <Button onClick={onClose} variant="outlined" size="small">
            Cerrar
        </Button>
    </DialogActions>
);
