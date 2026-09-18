import {
    Box,
    Button,
    ButtonGroup,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export const ProductoProvisorioItem = ({
    item,
    formatPrecio,
    onActualizarCantidad,
    onActualizarIndicaciones,
    onFocusIndicaciones,
    onBlurIndicaciones
}) => (
        <Box
            sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
            }}
        >
            <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2">
                            {item.producto.nombre}
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
                    variant="standard"
                    placeholder="Agregar indicaciones…"
                    value={item.indicaciones}
                    onChange={(event) => onActualizarIndicaciones(item.producto.id, event.target.value)}
                    onFocus={onFocusIndicaciones}
                    onBlur={onBlurIndicaciones}
                    multiline
                    maxRows={2}
                    sx={{
                        pl: 0.5,
                        '& .MuiInputBase-input': {
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            py: 0.25
                        }
                    }}
                />
            </Stack>
        </Box>
);
