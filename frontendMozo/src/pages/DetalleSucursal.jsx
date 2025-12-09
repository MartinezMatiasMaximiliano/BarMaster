import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SucursalContext } from '../App';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Divider,
    Chip,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import LoginIcon from '@mui/icons-material/Login';

// Datos de prueba (en producción esto vendría de la API)
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
                "IdEmpresa": 1
            },
            {
                "Id": 2,
                "Direccion": "Chacabuco 136",
                "Telefono": "381-422-8899",
                "IdEmpresa": 1
            },
            {
                "Id": 3,
                "Direccion": "Lavalle y 9 de Julio",
                "Telefono": "381-431-7722",
                "IdEmpresa": 1
            }
        ]
    }
];

function DetalleSucursal() {
    const { idEmpresa, idSucursal } = useParams();
    const navigate = useNavigate();
    const { setSucursalActiva } = useContext(SucursalContext);
    const [loading, setLoading] = useState(true);
    const [empresa, setEmpresa] = useState(null);
    const [sucursal, setSucursal] = useState(null);

    useEffect(() => {
        // Simular carga de datos (en producción esto sería una llamada a la API)
        const cargarDatos = async () => {
            setLoading(true);
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const empresaEncontrada = datosPrueba.find(e => e.Id === parseInt(idEmpresa));
            if (empresaEncontrada) {
                const sucursalEncontrada = empresaEncontrada.Sucursales.find(
                    s => s.Id === parseInt(idSucursal)
                );
                setEmpresa(empresaEncontrada);
                setSucursal(sucursalEncontrada);
            }
            setLoading(false);
        };

        cargarDatos();
    }, [idEmpresa, idSucursal]);

    const handleEntrarSistema = () => {
        if (!sucursal || !empresa) return;

        // Crear objeto con información de la sucursal activa
        const sucursalInfo = {
            Id: sucursal.Id,
            Direccion: sucursal.Direccion,
            Telefono: sucursal.Telefono,
            IdEmpresa: empresa.Id,
            NombreEmpresa: empresa.Nombre
        };

        // Guardar en el contexto y localStorage
        setSucursalActiva(sucursalInfo);
        localStorage.setItem('sucursalActiva', JSON.stringify(sucursalInfo));

        // Redirigir a la página principal
        // Los datos se cargarán automáticamente al cambiar sucursalActiva (vía useEffect en App.jsx)
        navigate('/');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!empresa || !sucursal) {
        return (
            <Box sx={{ width: '100%', height: '100%' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/panel_sucursales')}
                    sx={{ mb: 2 }}
                >
                    Volver al Panel
                </Button>
                <Alert severity="error">
                    Sucursal no encontrada
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Botón de regreso */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/panel_sucursales')}
                sx={{ mb: 3, alignSelf: 'flex-start' }}
            >
                Volver al Panel de Sucursales
            </Button>

            {/* Información de la Empresa */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                            {empresa.Nombre}
                        </Typography>
                    </Stack>
                    {empresa.Emails && empresa.Emails.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                            {empresa.Emails.map((email, index) => (
                                <Chip
                                    key={index}
                                    label={email}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {/* Información detallada de la Sucursal */}
            <Card sx={{ flexGrow: 1 }}>
                <CardContent>
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <StorefrontIcon color="primary" />
                            <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
                                Sucursal
                            </Typography>
                        </Stack>

                        <Divider />

                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Dirección
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                        {sucursal.Direccion}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <PhoneIcon color="primary" sx={{ mt: 0.5 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Teléfono
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                        {sucursal.Telefono}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* Botón para entrar al sistema */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<LoginIcon />}
                                onClick={handleEntrarSistema}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600
                                }}
                            >
                                Entrar al Sistema de esta Sucursal
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default DetalleSucursal;

