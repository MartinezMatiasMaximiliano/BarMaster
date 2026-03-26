import React from 'react';
import {
    Card,
    CardContent,
    Stack,
    Box,
    Typography,
    Divider,
    Chip
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmailIcon from '@mui/icons-material/Email';
import SucursalCard from './SucursalCard';

const EmpresaCard = ({ empresa, onSucursalEnter }) => {
    return (
        <Card
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
            }}
        >
            <CardContent sx={{
                flexGrow: 1,
                p: { xs: 2.5, sm: 3, md: 4 },
                '&:last-child': { pb: { xs: 2.5, sm: 3, md: 4 } }
            }}>
                {/* Header */}
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ mb: 2.5, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
                >
                    <StorefrontIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography
                        variant="h5"
                        component="h2"
                        sx={{ fontWeight: 700, color: 'text.primary' }}
                    >
                        {empresa.nombre}
                    </Typography>
                </Stack>

                {/* Emails */}
                {empresa.emails && empresa.emails.length > 0 && (
                    <Box sx={{ mb: 2.5 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                                Emails de contacto
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {empresa.emails.map((email, index) => (
                                <Chip
                                    key={index}
                                    label={email}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.8rem' }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}

                <Divider sx={{ mb: 2.5 }} />

                {/* Sucursales */}
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Sucursales
                        </Typography>
                        <Box
                            component="span"
                            sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                lineHeight: 1.5
                            }}
                        >
                            {empresa.sucursales?.length || 0}
                        </Box>
                    </Stack>

                    {empresa.sucursales && empresa.sucursales.length > 0 ? (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: 2
                        }}>
                            {empresa.sucursales.map((sucursal, index) => (
                                <SucursalCard
                                    key={sucursal.id || index}
                                    sucursal={sucursal}
                                    onEnter={(suc) => onSucursalEnter(suc, empresa.id)}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ p: 3, textAlign: 'center', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider' }}>
                            <Typography variant="body2" color="text.secondary">
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
