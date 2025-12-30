// components/Mesa/MesaButton.jsx
import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBurger } from '@fortawesome/free-solid-svg-icons';

// Mapeo de variantes de react-bootstrap a Material UI
const variantMap = {
    'primary': 'contained',
    'success': 'contained',
    'secondary': 'outlined',
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
                },
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <FontAwesomeIcon icon={faBurger} style={{ fontSize: '1.5rem' }} />
            <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                {prefix} {numeroMesa}
            </Typography>
        </Button>
    );
};