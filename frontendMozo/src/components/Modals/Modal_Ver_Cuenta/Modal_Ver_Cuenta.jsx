import { memo } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Tab,
    Tabs,
    Typography,
    Box
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useModalVerCuenta } from './hooks/useModalVerCuenta';
import ChipsHeader from './components/ChipsHeader';
import TabContent from './components/TabContent';
import Modal_Generico from '../Modal_Generico';

/**
 * Modal para ver y gestionar la cuenta de una mesa
 * Permite ver resumen, tickets abiertos y pagos registrados
 * También permite facturar todos los items pendientes
 */
function Modal_Ver_Cuenta(props) {
    const {
        show,
        tabValue,
        pedidosMesa,
        itemsAPagar,
        totalPedidos,
        cantidadItems,
        currencyFormatter,
        handleClose,
        handleShow,
        handleTabChange,
        PagarMesa
    } = useModalVerCuenta(props.datos_mesa, props.cerrar_modal_mesa);

    return (
        <>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleShow}
                startIcon={<ReceiptIcon />}
                sx={{ 
                    width: '100%',
                    py: 1.5
                }}
            >
                {props.textoBoton}
            </Button>

            <Dialog
                open={show}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                disableEnforceFocus
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ReceiptLongIcon color="primary" />
                            <Typography variant="h6">
                                {props.titulo} · Mesa {props.datos_mesa.numeroMesa}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    <ChipsHeader
                        codigoParaPedir={props.datos_mesa.codigoParaPedir}
                        cantidadItems={cantidadItems}
                        totalPedidos={totalPedidos}
                        currencyFormatter={currencyFormatter}
                    />

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                    >
                        <Tab
                            label="Resumen"
                            icon={<ShoppingCartIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Tickets abiertos"
                            icon={<ReceiptIcon />}
                            iconPosition="start"
                            disabled={!pedidosMesa[0]}
                        />
                        <Tab
                            label="Pagos registrados"
                            icon={<CheckCircleIcon />}
                            iconPosition="start"
                            disabled={!pedidosMesa[0]}
                        />
                    </Tabs>

                    <Box sx={{ p: 3, minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
                        {tabValue === 0 && (
                            <TabContent
                                pedidosMesa={pedidosMesa}
                                estado={false}
                                titulo="Pedido total"
                                subtitulo="Total"
                            />
                        )}

                        {tabValue === 1 && (
                            <TabContent
                                pedidosMesa={pedidosMesa}
                                estado={1}
                                titulo="Ticket"
                                PagarMesa={PagarMesa}
                                facturar={true}
                            />
                        )}

                        {tabValue === 2 && (
                            <TabContent
                                pedidosMesa={pedidosMesa}
                                estado={2}
                                titulo="Pagado"
                                subtitulo="Subtotal"
                            />
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 4, py: 3 }}>
                    <Modal_Generico
                        textoBoton="Facturar todo"
                        titulo="Facturar todo"
                        cuerpo="¿Confirmar la acción?"
                        confirmar={true}
                        func={PagarMesa}
                        param={itemsAPagar}
                        disabled={!(itemsAPagar.length > 0)}
                        color="success"
                    />
                    <Button onClick={handleClose} variant="outlined">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default memo(Modal_Ver_Cuenta);

