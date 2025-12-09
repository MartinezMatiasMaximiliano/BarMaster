import React, { useState } from 'react';
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
    Alert
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

// Datos de prueba
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

function PanelSucursales() {
    const [empresas] = useState(datosPrueba);
    const navigate = useNavigate();

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box sx={{ mb: 3, width: '100%' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                    Panel de Sucursales
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualiza todas las empresas y sus sucursales
                </Typography>
            </Box>

            {empresas.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
                    No se encontraron empresas con sucursales.
                </Alert>
            ) : (
                <Box sx={{ flexGrow: 1, overflow: 'auto', width: '100%', minWidth: 0 }}>
                    <Grid container spacing={3} sx={{ width: '100%', margin: 0, maxWidth: '100%' }}>
                        {empresas.map((empresa) => (
                            <Grid item xs={12} key={empresa.Id} sx={{ width: '100%', maxWidth: '100%', padding: '0 !important' }}>
                                <Card
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Header de la Empresa */}
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <StorefrontIcon color="primary" />
                                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                            {empresa.Nombre}
                                        </Typography>
                                    </Stack>

                                    {/* Emails */}
                                    {empresa.Emails && empresa.Emails.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <EmailIcon fontSize="small" color="action" />
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    Emails de contacto:
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                {empresa.Emails.map((email, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={email}
                                                        size="small"
                                                        variant="outlined"
                                                        icon={<EmailIcon fontSize="small" />}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    <Divider sx={{ my: 2 }} />

                                    {/* Sucursales */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                                            Sucursales ({empresa.Sucursales?.length || 0})
                                        </Typography>
                                        {empresa.Sucursales && empresa.Sucursales.length > 0 ? (
                                            <Stack spacing={2}>
                                                {empresa.Sucursales.map((sucursal, index) => (
                                                    <Card
                                                        key={index}
                                                        variant="outlined"
                                                        onClick={() => navigate(`/sucursal/${empresa.Id}/${sucursal.Id}`)}
                                                        sx={{
                                                            p: 2,
                                                            bgcolor: 'background.default',
                                                            transition: 'all 0.2s',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                bgcolor: 'action.hover',
                                                                transform: 'translateX(4px)',
                                                                boxShadow: 2
                                                            }
                                                        }}
                                                    >
                                                        <Stack spacing={1.5}>
                                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                                <LocationOnIcon fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                        Dirección:
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                        {sucursal.Direccion}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                                <PhoneIcon fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                        Teléfono:
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                        {sucursal.Telefono}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Stack>
                                                    </Card>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                No hay sucursales registradas para esta empresa.
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default PanelSucursales;

