import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography
} from '@mui/material';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

const Tecla = ({ children }) => (
    <Box
        component="kbd"
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 28,
            px: 1,
            border: 1,
            borderColor: 'divider',
            borderBottomWidth: 3,
            borderRadius: 1,
            bgcolor: 'background.default',
            color: 'text.primary',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            fontWeight: 700,
            whiteSpace: 'nowrap'
        }}
    >
        {children}
    </Box>
);

const FilaAtajo = ({ teclas, titulo, detalle }) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 160 }}>
            {teclas.map((tecla, indice) => (
                <Box key={`${tecla}-${indice}`} sx={{ display: 'contents' }}>
                    {indice > 0 && <Typography color="text.secondary">+</Typography>}
                    <Tecla>{tecla}</Tecla>
                </Box>
            ))}
        </Stack>
        <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{titulo}</Typography>
            <Typography variant="caption" color="text.secondary">{detalle}</Typography>
        </Box>
    </Stack>
);

const Ayuda = ({ children }) => (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <LightbulbOutlinedIcon color="warning" fontSize="small" sx={{ mt: 0.2 }} />
        <Typography variant="body2">{children}</Typography>
    </Stack>
);

export const AyudaAtajosDialog = ({ open, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="ayuda-atajos-title"
        PaperProps={{ sx: { borderRadius: 3 } }}
    >
        <DialogTitle id="ayuda-atajos-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
            <KeyboardOutlinedIcon color="primary" />
            Acciones rápidas con el teclado
        </DialogTitle>
        <DialogContent>
            <Stack spacing={2.25}>
                <Box>
                    <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                        Pantalla de mesas
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 0.75 }}>
                        <FilaAtajo
                            teclas={['Shift', 'N.º de mesa']}
                            titulo="Abrir una mesa"
                            detalle="Dejá apretada la tecla Shift, escribí el número completo de la mesa y después soltala. Por ejemplo: Shift + 42."
                        />
                        <FilaAtajo
                            teclas={['Esc']}
                            titulo="Borrar el código de mozo"
                            detalle="En la pantalla de mesas, borra todo el código ingresado."
                        />
                    </Stack>
                </Box>

                <Divider />

                <Box>
                    <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                        Al cargar productos en una mesa
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 0.75 }}>
                        <FilaAtajo
                            teclas={['Enter']}
                            titulo="Sumar una unidad"
                            detalle="Usalo cuando en la lista queda solamente el producto que buscaste."
                        />
                        <FilaAtajo
                            teclas={['Supr']}
                            titulo="Quitar una unidad"
                            detalle="Quita una unidad del producto encontrado. Si era la última, desaparece del pedido."
                        />
                        <FilaAtajo
                            teclas={['Shift', 'I']}
                            titulo="Imprimir cuenta"
                            detalle="Solicita la impresión de la cuenta de la mesa abierta."
                        />
                        <FilaAtajo
                            titulo="Cobrar todo"
                            detalle="Mantené Shift, pulsá C y soltá Shift para cobrar todos los productos pendientes."
                            teclas={['Shift', 'C']}
                        />
                        <FilaAtajo
                            titulo="Cobrar por partes"
                            detalle="Sin soltar Shift, pulsá C y después X para cobrar los productos seleccionados."
                            teclas={['Shift', 'C', 'X']}
                        />
                        <FilaAtajo
                            teclas={['Esc']}
                            titulo="Cerrar la ventana"
                            detalle="Cierra la ventana que estés usando en ese momento."
                        />
                    </Stack>
                </Box>

                <Divider />

                <Box>
                    <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                        También podés empezar a escribir directamente
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 0.75 }}>
                        <Ayuda>
                            Para ingresar el código de mozo, simplemente empezá a escribirlo. No hace falta hacer clic primero en el recuadro “Código”.
                        </Ayuda>
                        <Ayuda>
                            Cuando tengas una mesa abierta, empezá a escribir el nombre del producto. No hace falta hacer clic primero en “Buscar productos”.
                        </Ayuda>
                    </Stack>
                </Box>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button data-enter-action="true" data-escape-action="true" variant="contained" onClick={onClose}>
                Entendido
            </Button>
        </DialogActions>
    </Dialog>
);
