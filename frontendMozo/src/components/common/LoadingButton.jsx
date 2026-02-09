import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * Componente Button que maneja automáticamente el estado de loading
 * cuando se le pasa una función async como onClick.
 * 
 * @param {Function} onClick - Función que se ejecutará al hacer clic (puede ser async)
 * @param {boolean} loading - Estado de loading manual (opcional, se maneja automáticamente si onClick retorna Promise)
 * @param {React.ReactNode} children - Contenido del botón
 * @param {React.ReactNode} startIcon - Icono inicial (se reemplaza por spinner cuando está loading)
 * @param {Object} ...props - Todas las demás props se pasan al Button de MUI
 */
export const LoadingButton = ({ 
    onClick, 
    loading: loadingProp, 
    children, 
    startIcon,
    ...props 
}) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async (event) => {
        if (!onClick) return;

        try {
            setLoading(true);
            const result = onClick(event);
            
            // Si la función retorna una Promise, esperar a que termine
            if (result && typeof result.then === 'function') {
                await result;
            }
        } catch (error) {
            // El error debe ser manejado por la función onClick
            // No hacemos nada aquí para no interferir con el manejo de errores
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loadingProp !== undefined ? loadingProp : loading;

    return (
        <Button
            {...props}
            onClick={handleClick}
            disabled={isLoading || props.disabled}
            startIcon={
                isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                ) : (
                    startIcon
                )
            }
        >
            {children}
        </Button>
    );
};
