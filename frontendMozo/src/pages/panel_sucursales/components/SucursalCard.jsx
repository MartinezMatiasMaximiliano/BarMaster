import React from 'react';
import {
    Card,
    Stack,
    Box,
    Typography,
    Divider,
    Button,
    Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoginIcon from '@mui/icons-material/Login';
import { modulosConfig, planColors } from '../utils/constants';

const SucursalCard = ({ sucursal, onEnter }) => {
    return (
        <Card
            variant="outlined"
            sx={{
                p: 2.5,
                width: '100%',
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                }
            }}
        >
            <Stack spacing={1.5} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Título: dirección */}
                <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {sucursal.direccion || '—'}
                    </Typography>
                </Stack>

                {/* Usuario */}
                <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                        {sucursal.username}
                    </Typography>
                </Stack>

                {/* Teléfono */}
                <Stack direction="row" spacing={1} alignItems="flex-start">
                    <PhoneIcon fontSize="small" color="action" sx={{ mt: 0.3, flexShrink: 0 }} />
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                            Teléfono
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {sucursal.telefono || '—'}
                        </Typography>
                    </Box>
                </Stack>

                {/* Plan */}
                {sucursal.plan && (
                    <>
                        <Divider />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                                Plan
                            </Typography>
                            <Chip
                                label={sucursal.plan.nombre}
                                color={planColors[sucursal.plan.nombre] || 'default'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>
                    </>
                )}

                {/* Módulos */}
                {sucursal.modulos && sucursal.modulos.length > 0 && (
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5, display: 'block', mb: 0.75 }}>
                            Módulos ({sucursal.modulos.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {sucursal.modulos.map((modulo, modIndex) => {
                                const config = modulosConfig[modulo] || { IconComponent: CheckCircleIcon, color: 'default' };
                                const IconComponent = config.IconComponent;
                                return (
                                    <Chip
                                        key={modIndex}
                                        icon={<Box sx={{ color: `${config.color}.main` }}><IconComponent /></Box>}
                                        label={modulo}
                                        size="small"
                                        variant="outlined"
                                        color={config.color}
                                        sx={{ fontSize: '0.7rem', height: '24px', '& .MuiChip-icon': { fontSize: '16px' } }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 'auto', pt: 1.5 }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Button
                        variant="contained"
                        fullWidth
                        size="medium"
                        startIcon={<LoginIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEnter?.(sucursal);
                        }}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1.5,
                        }}
                    >
                        Entrar
                    </Button>
                </Box>
            </Stack>
        </Card>
    );
};

export default SucursalCard;
