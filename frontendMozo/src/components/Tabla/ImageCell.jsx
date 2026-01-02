import { useState, useEffect, useRef, useMemo, memo } from "react";
import { Avatar, Box, Skeleton } from "@mui/material";
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

/**
 * Componente optimizado para mostrar imágenes con lazy loading
 * Solo carga la imagen cuando está visible en el viewport
 */
function ImageCell({ src }) {
    const [error, setError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    // Memoizar la URL de la imagen
    const imageUrl = useMemo(() => {
        if (!src) return null;
        const baseUrl = (import.meta.env.VITE_BASE_URL || '').trim().replace(/\/+$/, '');
        const imagePath = src.startsWith('/') ? src : `/${src}`;
        return `${baseUrl}${imagePath}`;
    }, [src]);

    // Intersection Observer para lazy loading
    useEffect(() => {
        if (!imgRef.current || !imageUrl) return;

        // Si el navegador no soporta Intersection Observer, cargar inmediatamente
        if (!window.IntersectionObserver) {
            setIsVisible(true);
            return;
        }

        // Crear observer con un margen para cargar antes de que sea visible
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        // Desconectar después de la primera carga
                        if (observerRef.current) {
                            observerRef.current.disconnect();
                            observerRef.current = null;
                        }
                    }
                });
            },
            {
                rootMargin: '50px', // Cargar 50px antes de que sea visible
                threshold: 0.01
            }
        );

        observerRef.current.observe(imgRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [imageUrl]);

    // Si no hay imagen o hay error, mostrar placeholder
    if (!imageUrl || error) {
        return (
            <Avatar
                variant="rounded"
                sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'grey.200',
                }}
            >
                <ImageNotSupportedIcon color="disabled" />
            </Avatar>
        );
    }

    return (
        <Box
            ref={imgRef}
            sx={{
                width: 80,
                height: 80,
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.100',
            }}
        >
            {isVisible ? (
                <>
                    {isLoading && (
                        <Skeleton
                            variant="rectangular"
                            width={80}
                            height={80}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        />
                    )}
                    <Box
                        component="img"
                        src={imageUrl}
                        onError={() => {
                            setError(true);
                            setIsLoading(false);
                        }}
                        onLoad={() => setIsLoading(false)}
                        alt="Producto"
                        loading="lazy"
                        decoding="async"
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: isLoading ? 0 : 1,
                            transition: 'opacity 0.3s ease',
                        }}
                    />
                </>
            ) : (
                <Skeleton
                    variant="rectangular"
                    width={80}
                    height={80}
                />
            )}
        </Box>
    );
}

// Memoizar para evitar re-renders cuando src no cambia
export default memo(ImageCell, (prevProps, nextProps) => {
    return prevProps.src === nextProps.src;
});

