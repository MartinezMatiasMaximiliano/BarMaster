import {
    Box,
    Button,
    ButtonGroup,
    Card,
    Chip,
    CircularProgress,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveIcon from '@mui/icons-material/Remove';

const calcularProgreso = (remainingMs, durationMs) => {
    if (remainingMs <= 0) return 0;
    return Math.max(0, Math.min(100, (remainingMs / durationMs) * 100));
};

export const ProductoProvisorioItem = ({
    item,
    formatPrecio,
    autoSubmit,
    onActualizarCantidad,
    onActualizarIndicaciones,
    onFocusIndicaciones,
    onBlurIndicaciones
}) => {
    const progress = calcularProgreso(autoSubmit.remainingMs, autoSubmit.durationMs);
    const seconds = Math.ceil(autoSubmit.remainingMs / 1000);

    return (
        <Card
            variant="outlined"
            sx={{
                mt: 1,
                p: 1.25,
                borderColor: 'success.main',
                bgcolor: 'rgba(46, 125, 50, 0.06)'
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {item.producto.nombre}
                            </Typography>
                            <Chip label="Por agregar" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                            {autoSubmit.complete ? (
                                <CheckCircleIcon
                                    color="success"
                                    sx={{
                                        fontSize: 30,
                                        animation: 'autoSubmitOk 420ms ease-out',
                                        '@keyframes autoSubmitOk': {
                                            '0%': { transform: 'scale(0.4)', opacity: 0 },
                                            '65%': { transform: 'scale(1.18)', opacity: 1 },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    }}
                                />
                            ) : autoSubmit.remainingMs > 0 && !autoSubmit.paused && (
                                <Box sx={{ position: 'relative', display: 'inline-flex', width: 30, height: 30 }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={progress}
                                        size={30}
                                        thickness={5}
                                        color="success"
                                    />
                                    <Box
                                        sx={{
                                            inset: 0,
                                            position: 'absolute',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="caption" component="div" sx={{ fontSize: '0.65rem', fontWeight: 800 }}>
                                            {seconds}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            {formatPrecio(item.producto.precio)} c/u
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <ButtonGroup size="small" variant="outlined">
                            <Button onClick={() => onActualizarCantidad(item.producto.id, item.cantidad - 1)}>
                                <RemoveIcon fontSize="small" />
                            </Button>
                            <Button disabled sx={{ minWidth: 38 }}>
                                {item.cantidad}
                            </Button>
                            <Button onClick={() => onActualizarCantidad(item.producto.id, item.cantidad + 1)}>
                                <AddIcon fontSize="small" />
                            </Button>
                        </ButtonGroup>
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 84, textAlign: 'right' }}>
                            {formatPrecio(Number(item.producto.precio || 0) * Number(item.cantidad || 0))}
                        </Typography>
                    </Stack>
                </Stack>

                <TextField
                    fullWidth
                    size="small"
                    label={`Indicaciones: ${item.producto.nombre}`}
                    placeholder="Ej: Sin cebolla, bien cocido..."
                    value={item.indicaciones}
                    onChange={(event) => onActualizarIndicaciones(item.producto.id, event.target.value)}
                    onFocus={onFocusIndicaciones}
                    onBlur={onBlurIndicaciones}
                    multiline
                    rows={2}
                />
            </Stack>
        </Card>
    );
};
