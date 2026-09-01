import { Box, Button, DialogActions } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PrintIcon from '@mui/icons-material/Print';
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
    onPrintPreticket,
    printing,
    onClose
}) => (
    <DialogActions sx={{
        px: 3,
        py: 2,
        bgcolor: (theme) => theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.background.paper,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
                variant="contained"
                color="success"
                onClick={onFacturarTodo}
                disabled={!puedeFacturarTodo}
                startIcon={<ReceiptIcon />}
                size="small"
            >
                Cobrar todo
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={onFacturarPartes}
                disabled={productosSeleccionadosCount === 0}
                startIcon={<PlaylistAddCheckIcon />}
                size="small"
            >
                Cobrar por partes {productosSeleccionadosCount > 0 && `(${productosSeleccionadosCount})`}
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
            <Button
                variant="outlined"
                color="primary"
                onClick={onPrintPreticket}
                disabled={printing || !puedeFacturarTodo}
                startIcon={<PrintIcon />}
                size="small"
            >
                {printing ? 'Imprimiendo…' : 'Imprimir Preticket'}
            </Button>
        </Box>
        <Button onClick={onClose} variant="outlined" size="small">
            Cerrar
        </Button>
    </DialogActions>
);
