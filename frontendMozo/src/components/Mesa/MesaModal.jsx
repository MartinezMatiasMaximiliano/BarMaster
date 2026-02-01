// components/Mesa/MesaModal.jsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Typography,
    Stack,
    Box,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Lista from "../Listas/Lista";
import Modal_Generico from "../Modals/Modal_Generico";
import Modal_Ver_Cuenta from "../Modals/Modal_Ver_Cuenta/Modal_Ver_Cuenta";
import Modal_AgregarPedidos from "../Modals/Agregar_Pedidos/Modal_AgregarPedidos";
import { formatearFecha, calcularTotalPrecio } from './dateFormatter';

export const MesaModal = ({
    show,
    handleClose,
    datos_mesa,
    visitaMesa,
    productos,
    checkBoxSeleccionados,
    handleChangeCheckBox,
    activarCancelarPedido,
    onCancelarPedidos,
    onCerrarMesa
}) => {
    const [showAgregarPedidos, setShowAgregarPedidos] = useState(false);
    const fechaFormateada = formatearFecha(visitaMesa?.fechaHora);
    const totalPrecio = calcularTotalPrecio(productos);

    return (
        <Dialog 
            open={show} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            disableEnforceFocus
        >
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayIcon color="action" />
                            <Typography variant="h6" color="text.secondary" component="span">
                                {fechaFormateada}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TableRestaurantIcon color="primary" />
                            <Typography variant="h6" component="span">
                                Mesa {datos_mesa.numeroMesa}
                            </Typography>
                        </Stack>
                        {datos_mesa.codigoParaPedir && (
                            <Alert
                                icon={<VpnKeyIcon />}
                                severity="warning"
                                sx={{ fontSize: '1.2rem', py: 0.5, px: 1 }}
                            >
                                {datos_mesa.codigoParaPedir}
                            </Alert>
                        )}
                    </Stack>
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
                <Box 
                    sx={{ 
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AttachMoneyIcon color="primary" />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            Total: ${totalPrecio}
                        </Typography>
                    </Stack>
                </Box>
                
                <Box 
                    sx={{ 
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <RestaurantMenuIcon color="primary" />
                            <Typography variant="h6" component="h3">
                                Pedidos Actuales
                            </Typography>
                            {productos && productos.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    ({productos.length} {productos.length === 1 ? 'item' : 'items'})
                                </Typography>
                            )}
                        </Stack>
                        {(!productos || productos.length === 0) ? (
                            <Box
                                sx={{
                                    p: 3,
                                    textAlign: 'center'
                                }}
                            >
                                <RestaurantMenuIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight="medium">
                                    No hay pedidos actualmente
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Los pedidos que se agreguen a esta mesa aparecerán aquí
                                </Typography>
                            </Box>
                        ) : (
                            <Lista
                                items={productos}
                                handleCheckBox={handleChangeCheckBox}
                                checkBoxSeleccionados={checkBoxSeleccionados}
                            />
                        )}
                    </Stack>
                </Box>

                {datos_mesa.codigoParaPedir && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 2
                        }}
                    >
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={() => setShowAgregarPedidos(true)}
                            sx={{ 
                                width: '100%',
                                py: 1.5
                            }}
                        >
                            Agregar Pedidos
                        </Button>

                        <Modal_Ver_Cuenta
                            titulo="Ver cuenta"
                            numeroMesa={datos_mesa.numeroMesa}
                            datos_mesa={datos_mesa}
                            textoBoton="Ver cuenta"
                            cerrar_modal={handleClose}
                            func={handleClose}
                            cerrar_modal_mesa={handleClose}
                        />

                        <Modal_Generico
                            confirmar={true}
                            titulo="¿Seguro que desea cerrar la mesa?"
                            cuerpo="Todos los pedidos pendientes se marcarán como pagados"
                            textoBoton="Cerrar mesa"
                            func={onCerrarMesa}
                            param={datos_mesa.id}
                            cerrar_modal={handleClose}
                            disabled={false}
                        />

                        <Modal_Generico
                            confirmar={true}
                            titulo="Cancelar pedidos"
                            cuerpo="¿Seguro que desea cancelar los pedidos?"
                            textoBoton="Cancelar pedidos"
                            func={onCancelarPedidos}
                            param={checkBoxSeleccionados}
                            cerrar_modal={handleClose}
                            disabled={activarCancelarPedido}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleClose}
                >
                    Cerrar
                </Button>
            </DialogActions>

            {/* Modal para agregar pedidos */}
            <Modal_AgregarPedidos
                open={showAgregarPedidos}
                onClose={() => setShowAgregarPedidos(false)}
                numeroMesa={datos_mesa.numeroMesa}
            />
        </Dialog>
    );
};