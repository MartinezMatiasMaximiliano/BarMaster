import { useState, useEffect, useMemo } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TagIcon from '@mui/icons-material/Tag';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { ObtenerPlanEmpresa, ObtenerDatosEmpresa } from '../API/APIEmpresas';

// Mapeo de módulos a iconos y colores
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

// Mapeo de planes a colores
const planColors = {
    'Plan Inicial': 'primary',
    'Plan Avanzado': 'success',
    'Plan Pro': 'warning'
};

function Mi_Plan() {
    const [planData, setPlanData] = useState(null);
    const [empresaData, setEmpresaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [plan, empresa] = await Promise.all([
                ObtenerPlanEmpresa(),
                ObtenerDatosEmpresa()
            ]);
            setPlanData(plan);
            setEmpresaData(empresa);
        } catch (err) {
            setError('No se pudo cargar la información. Por favor, intenta nuevamente.');
            console.error('Error al cargar los datos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2
            }),
        []
    );

    const dateFormatter = useMemo(
        () =>
            (dateString) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                return date.toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            },
        []
    );

    const isPlanActivo = useMemo(() => {
        if (!planData?.fechaFin) return false;
        const fechaFin = new Date(planData.fechaFin);
        return fechaFin >= new Date();
    }, [planData]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack alignItems="center" py={6}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
                        Cargando información del plan...
                    </Typography>
                </Stack>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" action={
                    <IconButton onClick={cargarDatos} size="small">
                        <RefreshIcon />
                    </IconButton>
                }>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!planData) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="info">
                    No se encontró información del plan.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <div>
                        <Typography variant="h4" gutterBottom>
                            Mi Plan
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Información de tu suscripción y módulos activos.
                        </Typography>
                    </div>
                    <Tooltip title="Recargar información">
                        <IconButton onClick={cargarDatos} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Información de la empresa */}
                {empresaData && (
                    <Card variant="outlined">
                        <CardHeader
                            title={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <BusinessIcon color="primary" />
                                    <Typography variant="h6">
                                        Información del Restaurante
                                    </Typography>
                                </Stack>
                            }
                        />
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                    gap: 3
                                }}
                            >
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <StoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Nombre
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" fontWeight="medium">
                                        {empresaData.nombreEmpresa || 'N/A'}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <StorefrontIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Sucursal
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" fontWeight="medium">
                                        #{empresaData.numeroSucursal || 'N/A'}
                                    </Typography>
                                </Stack>
                                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Dirección
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body1" fontWeight="medium">
                                            {empresaData.direccion || 'N/A'}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Estado del plan */}
                <Card variant="outlined">
                    <CardHeader
                        title={
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="h6">
                                    Plan Actual
                                </Typography>
                                <Chip
                                    label={planData.Plan || 'Sin plan'}
                                    color={planColors[planData.Plan] || 'default'}
                                    size="small"
                                />
                                {isPlanActivo ? (
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Activo"
                                        color="success"
                                        size="small"
                                    />
                                ) : (
                                    <Chip
                                        label="Vencido"
                                        color="error"
                                        size="small"
                                    />
                                )}
                            </Stack>
                        }
                    />
                    <CardContent>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                gap: 3
                            }}
                        >
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <TagIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        ID de Suscripción
                                    </Typography>
                                </Stack>
                                <Typography variant="body1" fontWeight="medium">
                                    #{planData.idSubscripcion || 'N/A'}
                                </Typography>
                            </Stack>
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <AttachMoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Precio
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <AttachMoneyIcon color="primary" fontSize="small" />
                                    <Typography variant="body1" fontWeight="medium">
                                        {planData.precio ? currencyFormatter.format(planData.precio) : 'N/A'}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                    <CalendarTodayIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                    Fecha de Inicio
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {dateFormatter(planData.fechaInicio)}
                                </Typography>
                            </Stack>
                            <Stack spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                    <CalendarTodayIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                    Fecha de Vencimiento
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    fontWeight="medium"
                                    color={isPlanActivo ? 'text.primary' : 'error'}
                                >
                                    {dateFormatter(planData.fechaFin)}
                                </Typography>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                {/* Módulos activos */}
                <Card variant="outlined">
                    <CardHeader
                        title="Módulos Incluidos"
                        subheader={`${planData.modulos?.length || 0} módulo${planData.modulos?.length !== 1 ? 's' : ''} activo${planData.modulos?.length !== 1 ? 's' : ''}`}
                    />
                    <Divider />
                    <CardContent>
                        {!planData.modulos || planData.modulos.length === 0 ? (
                            <Alert severity="info">
                                No hay módulos activos en tu plan.
                            </Alert>
                        ) : (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    gap: 2
                                }}
                            >
                                {planData.modulos.map((modulo, index) => {
                                    const config = modulosConfig[modulo] || {
                                        icon: <CheckCircleIcon />,
                                        color: 'default'
                                    };
                                    return (
                                        <Box key={index}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 2,
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        boxShadow: 3,
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        color: `${config.color}.main`,
                                                        mb: 1
                                                    }}
                                                >
                                                    {config.icon}
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    align="center"
                                                    fontWeight="medium"
                                                >
                                                    {modulo}
                                                </Typography>
                                            </Card>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
}

export default Mi_Plan;

