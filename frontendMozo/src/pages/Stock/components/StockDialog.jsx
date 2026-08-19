import { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel, Stack, Switch, TextField, Typography,
} from '@mui/material';

const valoresIniciales = (producto, tipo) => tipo === 'configuracion'
    ? {
        controlaStock: producto?.controlaStock ?? false,
        enviarAlerta: producto?.enviarAlerta ?? false,
        cantidadMinima: producto?.cantidadMinima ?? 0,
        cantidadInicial: 0,
    }
    : { cantidad: '', motivo: '' };

export default function StockDialog({ abierto, producto, tipo, onCerrar, onGuardar }) {
    const [valores, setValores] = useState(() => valoresIniciales(producto, tipo));
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (abierto) {
            setValores(valoresIniciales(producto, tipo));
            setError('');
        }
    }, [abierto, producto, tipo]);

    const actualizar = (campo, valor) => setValores((actuales) => ({ ...actuales, [campo]: valor }));

    const guardar = async () => {
        const payload = tipo === 'configuracion'
            ? {
                controlaStock: valores.controlaStock,
                enviarAlerta: valores.enviarAlerta,
                cantidadMinima: Number(valores.cantidadMinima),
                cantidadInicial: producto.configurado ? null : Number(valores.cantidadInicial),
            }
            : { cantidad: Number(valores.cantidad), motivo: valores.motivo.trim() };

        if (tipo === 'configuracion' && (!Number.isInteger(payload.cantidadMinima) || payload.cantidadMinima < 0)) {
            setError('La cantidad mínima debe ser un número entero no negativo.');
            return;
        }
        if (tipo === 'configuracion' && !producto.configurado
            && (!Number.isInteger(payload.cantidadInicial) || payload.cantidadInicial < 0)) {
            setError('La cantidad inicial debe ser un número entero no negativo.');
            return;
        }
        if (tipo === 'movimiento' && (!Number.isInteger(payload.cantidad) || payload.cantidad === 0)) {
            setError('Ingresá una cantidad entera distinta de cero.');
            return;
        }

        setGuardando(true);
        setError('');
        try {
            await onGuardar(payload);
            onCerrar();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const esConfiguracion = tipo === 'configuracion';

    return (
        <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
            <DialogTitle>{esConfiguracion ? 'Configurar stock' : 'Cargar stock'}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="subtitle1">{producto?.nombreProducto}</Typography>
                    {esConfiguracion ? (
                        <>
                            <FormControlLabel
                                control={(
                                    <Switch
                                        checked={valores.controlaStock}
                                        onChange={(event) => actualizar('controlaStock', event.target.checked)}
                                    />
                                )}
                                label="Controla stock"
                            />
                            <FormControlLabel
                                control={(
                                    <Switch
                                        checked={valores.enviarAlerta}
                                        onChange={(event) => actualizar('enviarAlerta', event.target.checked)}
                                        disabled={!valores.controlaStock}
                                    />
                                )}
                                label="Mostrar alerta de stock bajo en el inicio"
                            />
                            <TextField
                                label="Cantidad mínima"
                                type="number"
                                value={valores.cantidadMinima}
                                onChange={(event) => actualizar('cantidadMinima', event.target.value)}
                                inputProps={{ min: 0, step: 1 }}
                                helperText="Cantidad mínima indica con qué cantidad se activará una alerta de baja cantidad del producto"
                                required
                            />
                            {!producto?.configurado && (
                                <TextField
                                    label="Cantidad inicial"
                                    type="number"
                                    value={valores.cantidadInicial}
                                    onChange={(event) => actualizar('cantidadInicial', event.target.value)}
                                    inputProps={{ min: 0, step: 1 }}
                                    helperText="Solo se utiliza al configurar el producto por primera vez."
                                    required
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <TextField
                                label="Cantidad"
                                type="number"
                                value={valores.cantidad}
                                onChange={(event) => actualizar('cantidad', event.target.value)}
                                helperText="Usá un valor positivo para ingresar stock o negativo para registrar una merma."
                                inputProps={{ step: 1 }}
                                autoFocus
                                required
                            />
                            <TextField
                                label="Motivo"
                                value={valores.motivo}
                                onChange={(event) => actualizar('motivo', event.target.value)}
                                multiline
                                minRows={2}
                            />
                        </>
                    )}
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar} disabled={guardando}>Cancelar</Button>
                <Button onClick={guardar} variant="contained" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
