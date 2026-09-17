import { useState } from 'react';
import { Chip, CircularProgress } from '@mui/material';

export default function EstadoReservaChip({ estado, idEstado, onCambiar, onError }) {
    const [guardando, setGuardando] = useState(false);
    const cancelada = Number(idEstado) === 3;
    const nuevoEstado = cancelada ? 2 : 3;
    const cambiar = async () => {
        if (!onCambiar || guardando) return;
        setGuardando(true);
        try {
            await onCambiar(nuevoEstado);
        } catch (error) {
            onError?.(error?.message || 'No se pudo cambiar el estado de la reserva.');
        } finally {
            setGuardando(false);
        }
    };
    return <Chip label={guardando ? 'Guardando…' : estado} size="small" variant="filled"
        color={cancelada ? 'error' : 'success'}
        icon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
        onClick={onCambiar ? cambiar : undefined}
        disabled={guardando}
        aria-label={onCambiar ? `${estado}. Cambiar a ${cancelada ? 'Confirmada' : 'Cancelada'}` : undefined}
        className={`reserva-estado-chip ${cancelada ? 'reserva-estado-chip--cancelada' : 'reserva-estado-chip--confirmada'}`} />;
}
