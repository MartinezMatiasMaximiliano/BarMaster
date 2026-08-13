// components/Mesa/MesaButton.jsx
import React from 'react';
import { Button, Typography } from '@mui/material';

// Mapeo de variantes de react-bootstrap a Material UI
const variantMap = {
    'primary': 'contained',
    'success': 'contained',
    'secondary': 'contained',
    'danger': 'contained',
    'warning': 'contained',
    'info': 'contained',
    'light': 'outlined',
    'dark': 'contained'
};

// Mapeo de colores para variantes
const colorMap = {
    'primary': 'primary',
    'success': 'success',
    'secondary': 'secondary',
    'danger': 'error',
    'warning': 'warning',
    'info': 'info',
    'light': 'default',
    'dark': 'default'
};

export const MesaButton = ({ numeroMesa, estilo, variant, onClick, disabled = false, prefix = "Mesa", simpleStyle = false }) => {
    const muiVariant = variantMap[variant] || 'contained';
    const muiColor = colorMap[variant] || 'primary';
    const iconoMesa = variant === 'secondary'
        ? '/iconos/mesa_blanca.png'
        : '/iconos/mesa_ocupada_blanca.png';

    // Si simpleStyle es true, renderizar como botón simple sin iconos ni estilos personalizados
    if (simpleStyle) {
        return (
            <Button 
                variant={muiVariant}
                color={muiColor}
                onClick={onClick}
                disabled={disabled}
                sx={{
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    ...estilo,
                    ...(variant === 'success' ? { bgcolor: 'primary.main' } : {}),
                    ...(variant === 'success' ? { '&:hover': { bgcolor: 'primary.dark' } } : {}),
                }}
            >
                {prefix} {numeroMesa}
            </Button>
        );
    }

    // Estilo original con iconos
    return (
        <Button 
            variant={muiVariant}
            color={muiColor}
            onClick={onClick}
            disabled={disabled}
            sx={{
                ...estilo,
                mx: 1,
                py: 2,
                px: 3,
                minWidth: 120,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                textTransform: 'none',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                    ...(variant === 'success' ? { bgcolor: 'primary.dark' } : {}),
                },
                ...(variant === 'success' ? { bgcolor: 'primary.main' } : {}),
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <img
                src={iconoMesa}
                alt={variant === 'secondary' ? 'Mesa libre' : 'Mesa ocupada'}
                style={{ width: 49.68, height: 49.68, objectFit: 'contain' }}
            />
            <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                {prefix} {numeroMesa}
            </Typography>
        </Button>
    );
};
