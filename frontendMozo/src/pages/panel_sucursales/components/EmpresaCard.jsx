import React from 'react';
import {
    Card,
    CardContent,
    Stack,
    Box,
    Typography,
    Divider,
    Grid,
    Chip
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmailIcon from '@mui/icons-material/Email';
import SucursalCard from './SucursalCard';

/**
 * Componente que representa una tarjeta de empresa con sus sucursales
 */
const EmpresaCard = ({ empresa, onSucursalEnter }) => {
    return (
        <Card
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
                                <Grid key={index} sx={{ width: '100%', maxWidth: '100%' }}>
                                    <SucursalCard 
                                        sucursal={sucursal} 
                                        onEnter={onSucursalEnter}
                                    />
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
    );
};

export default EmpresaCard;

