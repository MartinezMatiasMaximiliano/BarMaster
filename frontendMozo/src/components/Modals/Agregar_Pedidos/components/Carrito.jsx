import {
    Paper,
    Stack,
    Typography,
    Box,
    Divider,
    IconButton,
    TextField,
    Chip,
    Card,
    ButtonGroup,
    Button
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { gradientPrimary } from '../../../../styles/buttonStyles';

export const Carrito = ({ 
    carrito, 
    totalCarrito, 
    onActualizarCantidad, 
    onActualizarIndicaciones 
}) => {
    return (
        <Paper
            sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '70vh'
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <ShoppingCartIcon color="primary" />
                <Typography variant="h6">
                    Carrito
                </Typography>
                {carrito.length > 0 && (
                    <Chip 
                        label={carrito.length} 
                        color="primary" 
                        size="small"
                        sx={{ ml: 0.5 }}
                    />
                )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {carrito.length === 0 ? (
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        El carrito está vacío.<br />
                        Haz clic en un producto para agregarlo.
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            mb: 2,
                            scrollbarGutter: 'stable',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                },
                            },
                        }}
                    >
                        <Stack spacing={2}>
                            {carrito.map((item) => {
                                const imagenFondo = item.producto.imagenUrl 
                                    ? `${import.meta.env.VITE_BASE_URL}${item.producto.imagenUrl}`
                                    : null;

                                return (
                                    <Box key={item.producto.id}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                width: '100%',
                                                backgroundImage: imagenFondo ? `url(${imagenFondo})` : gradientPrimary,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                minHeight: 120,
                                                position: 'relative',
                                                color: 'white',
                                                overflow: 'hidden',
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                            }}
                                        >
                                            {/* Overlay */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: imagenFondo ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.4)',
                                                    zIndex: 1,
                                                }}
                                            />

                                            {/* Contenido principal */}
                                            <Box sx={{ zIndex: 2, flex: 1, minWidth: 0 }}>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    fontWeight="bold" 
                                                    sx={{ 
                                                        mb: 0.5, 
                                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {item.producto.nombre}
                                                </Typography>
                                                <Typography variant="body2" color="white" sx={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)', fontSize: '0.75rem' }}>
                                                    ${item.producto.precio} c/u
                                                </Typography>
                                            </Box>

                                            {/* Contenido derecho */}
                                            <Box sx={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1.5 }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                                                    ${item.producto.precio * item.cantidad}
                                                </Typography>
                                                
                                                <ButtonGroup
                                                    variant="outlined"
                                                    color="inherit"
                                                    sx={{
                                                        '& .MuiButton-root': {
                                                            minWidth: '28px',
                                                            padding: '2px 6px',
                                                            fontSize: '0.7rem',
                                                            lineHeight: 1,
                                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                                            color: 'white',
                                                            '&:hover': {
                                                                borderColor: 'rgba(255, 255, 255, 0.8)',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Button 
                                                        onClick={() => onActualizarCantidad(item.producto.id, item.cantidad - 1)}
                                                        sx={{ 
                                                            '&:hover': { 
                                                                backgroundColor: 'rgba(211, 47, 47, 0.3)' 
                                                            } 
                                                        }}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </Button>
                                                    <Button sx={{ minWidth: '36px !important' }}>
                                                        {item.cantidad}
                                                    </Button>
                                                    <Button 
                                                        onClick={() => onActualizarCantidad(item.producto.id, item.cantidad + 1)}
                                                        sx={{ 
                                                            '&:hover': { 
                                                                backgroundColor: 'rgba(76, 175, 80, 0.3)' 
                                                            } 
                                                        }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </Button>
                                                </ButtonGroup>
                                            </Box>
                                        </Card>

                                        {/* Campo de indicaciones fuera del card */}
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={`Indicaciones: ${item.producto.nombre}`}
                                            placeholder="Ej: Sin cebolla, bien cocido..."
                                            value={item.indicaciones}
                                            onChange={(e) => onActualizarIndicaciones(item.producto.id, e.target.value)}
                                            multiline
                                            rows={2}
                                            sx={{
                                                mt: 1,
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'background.paper',
                                                },
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Total:
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            ${totalCarrito.toFixed(2)}
                        </Typography>
                    </Stack>
                </>
            )}
        </Paper>
    );
};

