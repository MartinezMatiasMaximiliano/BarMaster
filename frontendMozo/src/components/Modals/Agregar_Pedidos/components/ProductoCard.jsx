import { memo } from 'react';
import { Card, Typography, Box } from '@mui/material';
import { gradientPrimary } from '../../../../styles/buttonStyles';

const ProductoCardComponent = ({ producto, onAgregar }) => {
    const imagenFondo = producto.imagenUrl 
        ? `${import.meta.env.VITE_BASE_URL}${producto.imagenUrl}`
        : null;

    return (
        <Card
            variant="outlined"
            sx={{
                width: '100%',
                height: 240,
                minHeight: 240,
                maxHeight: 240,
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundImage: imagenFondo ? `url(${imagenFondo})` : gradientPrimary,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: imagenFondo ? 'rgba(0,0,0,0.15)' : undefined,
                borderRadius: 2,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: 8,
                    '& .overlay': {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    }
                }
            }}
            onClick={() => onAgregar(producto)}
        >
            {/* Overlay oscuro para legibilidad */}
            <Box
                className="overlay"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: imagenFondo ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1,
                    transition: 'background-color 0.3s ease',
                }}
            />

            {/* Gradiente inferior para mejor legibilidad del precio */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
                    zIndex: 1,
                }}
            />

            {/* Contenido */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2,
                    color: 'white',
                }}
            >
                {/* Nombre y descripción */}
                <Box>
                    <Typography
                        variant="h6"
                        component="h3"
                        fontWeight="bold"
                        sx={{
                            mb: 0.5,
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.3,
                        }}
                    >
                        {producto.nombre}
                    </Typography>
                    {producto.descripcion && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: '0.75rem',
                            }}
                        >
                            {producto.descripcion}
                        </Typography>
                    )}
                </Box>

                {/* Precio */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                            color: '#fff',
                        }}
                    >
                        ${producto.precio}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

export const ProductoCard = memo(ProductoCardComponent);
