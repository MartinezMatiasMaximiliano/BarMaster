import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    Stack,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TagIcon from '@mui/icons-material/Tag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloseIcon from '@mui/icons-material/Close';
import { LoginContext, AuthTypeContext } from '../App';
import { handleConfirmarSalir } from '../Helpers/HelperFunctions';

// Mapeo de módulos a iconos y colores (copiado de Mi_Plan.jsx)
const modulosConfig = {
    'Monitor de Cocina (KDS)': {
        icon: <RestaurantIcon />,
        color: 'primary'
    },
    'Gestión de Mesas': {
        icon: <TableRestaurantIcon />,
        color: 'success'
    },
    'Facturación Electrónica': {
        icon: <ReceiptIcon />,
        color: 'warning'
    },
    'Delivery/Take Away': {
        icon: <DeliveryDiningIcon />,
        color: 'info'
    }
};

// Mapeo de planes a colores (copiado de Mi_Plan.jsx)
const planColors = {
    'Plan Inicial': 'primary',
    'Plan Avanzado': 'success',
    'Plan Pro': 'warning'
};

// Precios de planes y módulos (datos de prueba)
const preciosPlanes = {
    'Plan Inicial': 8000,
    'Plan Avanzado': 15000,
    'Plan Pro': 25000
};

const preciosModulos = {
    'Monitor de Cocina (KDS)': 3000,
    'Gestión de Mesas': 2000,
    'Facturación Electrónica': 4000,
    'Delivery/Take Away': 3500
};

// Datos de facturación (datos de prueba)
const datosFacturacion = {
    totalPagar: 48000,
    fechaVencimiento: '2025-11-15',
    periodo: 'Noviembre 2025'
};

// Datos de prueba con información de planes y módulos
const datosPrueba = [
    {
        "Id": 1,
        "Nombre": "La Cafetería",
        "Emails": ["contacto@lacafeteria.com", "reservas@lacafeteria.com"],
        "Sucursales": [
            {
                "Id": 1,
                "Direccion": "Santiago y 25 de Mayo",
                "Telefono": "381-445-1200",
                "IdEmpresa": 1,
                "Plan": {
                    "nombre": "Plan Pro",
                    "precio": 25000,
                    "idSubscripcion": 101
                },
                "Modulos": [
                    "Monitor de Cocina (KDS)",
                    "Gestión de Mesas",
                    "Facturación Electrónica",
                    "Delivery/Take Away"
                ]
            },
            {
                "Id": 2,
                "Direccion": "Chacabuco 136",
                "Telefono": "381-422-8899",
                "IdEmpresa": 1,
                "Plan": {
                    "nombre": "Plan Avanzado",
                    "precio": 15000,
                    "idSubscripcion": 102
                },
                "Modulos": [
                    "Gestión de Mesas",
                    "Facturación Electrónica"
                ]
            },
            {
                "Id": 3,
                "Direccion": "Lavalle y 9 de Julio",
                "Telefono": "381-431-7722",
                "IdEmpresa": 1,
                "Plan": {
                    "nombre": "Plan Inicial",
                    "precio": 8000,
                    "idSubscripcion": 103
                },
                "Modulos": [
                    "Gestión de Mesas"
                ]
            }
        ]
    }
];

function PanelSucursales() {
    const [empresas] = useState(datosPrueba);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openPlanDialog, setOpenPlanDialog] = useState(false);
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);

    const handleAbrirConfirmacion = () => {
        setOpenConfirmDialog(true);
    };

    const handleCerrarConfirmacion = () => {
        setOpenConfirmDialog(false);
    };

    const handleAbrirPlanDialog = () => {
        setOpenPlanDialog(true);
    };

    const handleCerrarPlanDialog = () => {
        setOpenPlanDialog(false);
    };

    // Calcular el desglose de facturación por sucursal
    const calcularDesgloseFacturacion = () => {
        const desglose = [];
        empresas.forEach(empresa => {
            empresa.Sucursales.forEach(sucursal => {
                const items = [];
                let subtotal = 0;

                // Agregar plan
                if (sucursal.Plan) {
                    const precioPlan = preciosPlanes[sucursal.Plan.nombre] || 0;
                    items.push({
                        concepto: sucursal.Plan.nombre,
                        tipo: 'Plan',
                        precio: precioPlan
                    });
                    subtotal += precioPlan;
                }

                // Agregar módulos
                if (sucursal.Modulos && sucursal.Modulos.length > 0) {
                    sucursal.Modulos.forEach(modulo => {
                        const precioModulo = preciosModulos[modulo] || 0;
                        items.push({
                            concepto: modulo,
                            tipo: 'Módulo',
                            precio: precioModulo
                        });
                        subtotal += precioModulo;
                    });
                }

                desglose.push({
                    sucursal: sucursal.Direccion,
                    items: items,
                    subtotal: subtotal
                });
            });
        });
        return desglose;
    };

    const desgloseFacturacion = calcularDesgloseFacturacion();
    const totalCalculado = desgloseFacturacion.reduce((sum, item) => sum + item.subtotal, 0);

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ 
            width: '100%', 
            minHeight: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            py: 2
        }}>
            {/* Header */}
            <Box sx={{ 
                mb: 4, 
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2
            }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        Panel de Sucursales
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ fontSize: '1.1rem' }}
                    >
                        Administra y visualiza todas tus empresas y sucursales
                    </Typography>
                </Box>
                
                {/* Botones de acción */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={handleAbrirPlanDialog}
                        sx={{
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                            }
                        }}
                    >
                        Mi Plan
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleAbrirConfirmacion}
                        sx={{
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderWidth: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                borderWidth: 2,
                                transform: 'translateY(-2px)',
                                boxShadow: 4,
                                bgcolor: 'error.light',
                                color: 'error.dark'
                            }
                        }}
                    >
                        Salir
                    </Button>
                </Stack>
            </Box>

            {/* Diálogo de confirmación */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleCerrarConfirmacion}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minWidth: 400
                    }
                }}
            >
                <DialogTitle 
                    id="confirm-dialog-title"
                    sx={{ 
                        fontWeight: 600,
                        pb: 1
                    }}
                >
                    Confirmar salida
                </DialogTitle>
                <DialogContent>
                    <DialogContentText 
                        id="confirm-dialog-description"
                        sx={{ 
                            fontSize: '1rem',
                            color: 'text.primary'
                        }}
                    >
                        ¿Estás seguro de que deseas salir del sistema? 
                        <br />
                        Serás redirigido a la página de inicio de sesión.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button
                        onClick={handleCerrarConfirmacion}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => handleConfirmarSalir(loginContext, authTypeContext, setOpenConfirmDialog, navigate)}
                        variant="contained"
                        color="error"
                        startIcon={<LogoutIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3
                        }}
                    >
                        Salir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Mi Plan */}
            <Dialog
                open={openPlanDialog}
                onClose={handleCerrarPlanDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        fontWeight: 600,
                        pb: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AccountBalanceWalletIcon color="primary" />
                        <Typography variant="h6">Mi Plan - Resumen de Facturación</Typography>
                    </Stack>
                    <Button
                        onClick={handleCerrarPlanDialog}
                        size="small"
                        sx={{ minWidth: 'auto', p: 1 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3}>
                        {/* Resumen principal */}
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: 'primary.light',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            }}
                        >
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                        Período
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {datosFacturacion.periodo}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                            Total a Pagar
                                        </Typography>
                                        <Typography 
                                            variant="h4" 
                                            sx={{ 
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                            onClick={() => {
                                                const detalleElement = document.getElementById('detalle-facturacion');
                                                if (detalleElement) {
                                                    detalleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }}
                                        >
                                            ${datosFacturacion.totalPagar.toLocaleString('es-AR')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                            Vencimiento
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CalendarTodayIcon fontSize="small" color="primary" />
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {formatearFecha(datosFacturacion.fechaVencimiento)}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>

                        {/* Detalle de facturación */}
                        <Box id="detalle-facturacion">
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Detalle de Facturación por Sucursal
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Precio</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {desgloseFacturacion.map((sucursal, index) => (
                                            <React.Fragment key={index}>
                                                {sucursal.items.map((item, itemIndex) => (
                                                    <TableRow 
                                                        key={itemIndex}
                                                        sx={{
                                                            '&:last-child td': { borderBottom: itemIndex === sucursal.items.length - 1 ? '2px solid' : 'none' },
                                                            '&:last-child td:last-child': { borderBottom: itemIndex === sucursal.items.length - 1 ? '2px solid' : 'none' }
                                                        }}
                                                    >
                                                        {itemIndex === 0 && (
                                                            <TableCell 
                                                                rowSpan={sucursal.items.length}
                                                                sx={{ 
                                                                    fontWeight: 600,
                                                                    verticalAlign: 'top',
                                                                    pt: itemIndex === 0 ? 2 : 'auto'
                                                                }}
                                                            >
                                                                {sucursal.sucursal}
                                                            </TableCell>
                                                        )}
                                                        <TableCell>{item.concepto}</TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={item.tipo} 
                                                                size="small" 
                                                                color={item.tipo === 'Plan' ? 'primary' : 'secondary'}
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                            ${item.precio.toLocaleString('es-AR')}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                                                        Subtotal {sucursal.sucursal}:
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                        ${sucursal.subtotal.toLocaleString('es-AR')}
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        ))}
                                        <TableRow sx={{ bgcolor: 'primary.main', color: 'white' }}>
                                            <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                                TOTAL:
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                                ${totalCalculado.toLocaleString('es-AR')}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleCerrarPlanDialog}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {empresas.length === 0 ? (
                <Alert 
                    severity="info" 
                    sx={{ 
                        mb: 3, 
                        width: '100%',
                        borderRadius: 2,
                        fontSize: '1rem',
                        py: 2
                    }}
                >
                    No se encontraron empresas con sucursales.
                </Alert>
            ) : (
                <Box sx={{ 
                    flexGrow: 1, 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    {empresas.map((empresa) => (
                        <Card
                            key={empresa.Id}
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                    borderColor: 'primary.main'
                                }
                            }}
                        >
                            <CardContent sx={{ 
                                flexGrow: 1, 
                                p: { xs: 3, sm: 4, md: 5 },
                                '&:last-child': { pb: { xs: 3, sm: 4, md: 5 } }
                            }}>
                                {/* Header de la Empresa */}
                                <Stack 
                                    direction="row" 
                                    spacing={2} 
                                    alignItems="center" 
                                    sx={{ 
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: 2,
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'primary.light',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <StorefrontIcon 
                                            sx={{ 
                                                fontSize: { xs: 28, sm: 32 },
                                                color: 'primary.main'
                                            }} 
                                        />
                                    </Box>
                                    <Typography 
                                        variant="h4" 
                                        component="h2" 
                                        sx={{ 
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                                        }}
                                    >
                                        {empresa.Nombre}
                                    </Typography>
                                </Stack>

                                {/* Emails */}
                                {empresa.Emails && empresa.Emails.length > 0 && (
                                    <Box sx={{ 
                                        mb: 3,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'action.hover',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                            <EmailIcon fontSize="small" color="primary" />
                                            <Typography 
                                                variant="subtitle2" 
                                                color="text.secondary" 
                                                sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                                            >
                                                Emails de contacto:
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {empresa.Emails.map((email, index) => (
                                                <Chip
                                                    key={index}
                                                    label={email}
                                                    size="medium"
                                                    variant="outlined"
                                                    icon={<EmailIcon fontSize="small" />}
                                                    sx={{
                                                        borderColor: 'primary.main',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            bgcolor: 'primary.light',
                                                            color: 'primary.dark'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <Divider sx={{ my: 3 }} />

                                {/* Sucursales */}
                                <Box>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            mb: 3,
                                            color: 'text.primary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                fontSize: '0.875rem',
                                                fontWeight: 700
                                            }}
                                        >
                                            {empresa.Sucursales?.length || 0}
                                        </Box>
                                        Sucursal{empresa.Sucursales?.length !== 1 ? 'es' : ''}
                                    </Typography>
                                    {empresa.Sucursales && empresa.Sucursales.length > 0 ? (
                                        <Grid container spacing={2} sx={{ width: '100%' }}>
                                            {empresa.Sucursales.map((sucursal, index) => (
                                                <Grid item xs={12} key={index} sx={{ width: '100%', maxWidth: '100%' }}>
                                                    <Card
                                                        variant="outlined"
                                                        sx={{
                                                            p: 3,
                                                            width: '100%',
                                                            height: '100%',
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            border: '2px solid',
                                                            borderColor: 'divider',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            boxSizing: 'border-box',
                                                            '&::before': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '4px',
                                                                height: '100%',
                                                                bgcolor: 'primary.main',
                                                                transform: 'scaleY(0)',
                                                                transition: 'transform 0.3s'
                                                            },
                                                            '&:hover': {
                                                                bgcolor: 'action.hover',
                                                                transform: 'translateY(-4px)',
                                                                boxShadow: 4,
                                                                borderColor: 'primary.main',
                                                                '&::before': {
                                                                    transform: 'scaleY(1)'
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Stack spacing={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                                <Box
                                                                    sx={{
                                                                        p: 1,
                                                                        borderRadius: 1.5,
                                                                        bgcolor: 'primary.light',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        mt: 0.5
                                                                    }}
                                                                >
                                                                    <LocationOnIcon fontSize="small" color="primary" />
                                                                </Box>
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography 
                                                                        variant="caption" 
                                                                        color="text.secondary" 
                                                                        sx={{ 
                                                                            mb: 0.5,
                                                                            fontWeight: 600,
                                                                            textTransform: 'uppercase',
                                                                            fontSize: '0.7rem',
                                                                            letterSpacing: 0.5
                                                                        }}
                                                                    >
                                                                        Dirección
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="body1" 
                                                                        sx={{ 
                                                                            fontWeight: 600,
                                                                            color: 'text.primary',
                                                                            lineHeight: 1.4
                                                                        }}
                                                                    >
                                                                        {sucursal.Direccion}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                                <Box
                                                                    sx={{
                                                                        p: 1,
                                                                        borderRadius: 1.5,
                                                                        bgcolor: 'success.light',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        mt: 0.5
                                                                    }}
                                                                >
                                                                    <PhoneIcon fontSize="small" color="success" />
                                                                </Box>
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography 
                                                                        variant="caption" 
                                                                        color="text.secondary" 
                                                                        sx={{ 
                                                                            mb: 0.5,
                                                                            fontWeight: 600,
                                                                            textTransform: 'uppercase',
                                                                            fontSize: '0.7rem',
                                                                            letterSpacing: 0.5
                                                                        }}
                                                                    >
                                                                        Teléfono
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="body1" 
                                                                        sx={{ 
                                                                            fontWeight: 600,
                                                                            color: 'text.primary'
                                                                        }}
                                                                    >
                                                                        {sucursal.Telefono}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>

                                                            {/* Plan y Módulos */}
                                                            <Divider sx={{ my: 2 }} />
                                                            
                                                            {/* Plan */}
                                                            {sucursal.Plan && (
                                                                <Box>
                                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                                                        <TagIcon fontSize="small" color="primary" />
                                                                        <Typography 
                                                                            variant="caption" 
                                                                            color="text.secondary" 
                                                                            sx={{ 
                                                                                fontWeight: 600,
                                                                                textTransform: 'uppercase',
                                                                                fontSize: '0.7rem',
                                                                                letterSpacing: 0.5
                                                                            }}
                                                                        >
                                                                            Plan
                                                                        </Typography>
                                                                    </Stack>
                                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                                        <Chip
                                                                            label={sucursal.Plan.nombre}
                                                                            color={planColors[sucursal.Plan.nombre] || 'default'}
                                                                            size="small"
                                                                            sx={{ fontWeight: 600 }}
                                                                        />
                                                                        <Typography 
                                                                            variant="caption" 
                                                                            color="text.secondary"
                                                                            sx={{ ml: 'auto' }}
                                                                        >
                                                                            ${sucursal.Plan.precio?.toLocaleString('es-AR') || 'N/A'}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Box>
                                                            )}

                                                            {/* Módulos */}
                                                            {sucursal.Modulos && sucursal.Modulos.length > 0 && (
                                                                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                                                        <CheckCircleIcon fontSize="small" color="success" />
                                                                        <Typography 
                                                                            variant="caption" 
                                                                            color="text.secondary" 
                                                                            sx={{ 
                                                                                fontWeight: 600,
                                                                                textTransform: 'uppercase',
                                                                                fontSize: '0.7rem',
                                                                                letterSpacing: 0.5
                                                                            }}
                                                                        >
                                                                            Módulos ({sucursal.Modulos.length})
                                                                        </Typography>
                                                                    </Stack>
                                                                    <Box
                                                                        sx={{
                                                                            display: 'flex',
                                                                            flexWrap: 'wrap',
                                                                            gap: 1,
                                                                            maxHeight: '120px',
                                                                            overflowY: 'auto',
                                                                            '&::-webkit-scrollbar': {
                                                                                width: '6px',
                                                                            },
                                                                            '&::-webkit-scrollbar-track': {
                                                                                backgroundColor: 'transparent',
                                                                            },
                                                                            '&::-webkit-scrollbar-thumb': {
                                                                                backgroundColor: 'rgba(0,0,0,0.2)',
                                                                                borderRadius: '3px',
                                                                            },
                                                                        }}
                                                                    >
                                                                        {sucursal.Modulos.map((modulo, modIndex) => {
                                                                            const config = modulosConfig[modulo] || {
                                                                                icon: <CheckCircleIcon />,
                                                                                color: 'default'
                                                                            };
                                                                            return (
                                                                                <Chip
                                                                                    key={modIndex}
                                                                                    icon={
                                                                                        <Box sx={{ color: `${config.color}.main` }}>
                                                                                            {config.icon}
                                                                                        </Box>
                                                                                    }
                                                                                    label={modulo}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    color={config.color}
                                                                                    sx={{
                                                                                        fontSize: '0.7rem',
                                                                                        height: '24px',
                                                                                        '& .MuiChip-icon': {
                                                                                            fontSize: '16px'
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                </Box>
                                                            )}

                                                            {/* Divider y Botón Entrar */}
                                                            <Divider sx={{ my: 2 }} />
                                                            
                                                            <Button
                                                                variant="contained"
                                                                fullWidth
                                                                size="large"
                                                                endIcon={<ArrowForwardIcon />}
                                                                startIcon={<LoginIcon />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // TODO: Implementar funcionalidad de entrada
                                                                }}
                                                                sx={{
                                                                    mt: 'auto',
                                                                    flexShrink: 0,
                                                                    py: 1.5,
                                                                    borderRadius: 2,
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    fontSize: '1rem',
                                                                    fontWeight: 600,
                                                                    textTransform: 'none',
                                                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    '&:hover': {
                                                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                                                    },
                                                                    '&:active': {
                                                                        transform: 'translateY(0)',
                                                                    }
                                                                }}
                                                            >
                                                                Entrar
                                                            </Button>
                                                        </Stack>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box
                                            sx={{
                                                p: 4,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                bgcolor: 'action.hover',
                                                border: '2px dashed',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Typography 
                                                variant="body1" 
                                                color="text.secondary" 
                                                sx={{ fontStyle: 'italic' }}
                                            >
                                                No hay sucursales registradas para esta empresa.
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default PanelSucursales;

