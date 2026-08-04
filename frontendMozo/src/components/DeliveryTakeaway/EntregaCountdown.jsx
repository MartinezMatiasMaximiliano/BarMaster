import { useEffect, useRef, useState } from 'react';
import { Checkbox, LinearProgress, Stack } from '@mui/material';

const DURACION_TRANSICION_MS = 5000;

export default function EntregaCountdown({ onComplete, onCancel }) {
    const inicioRef = useRef(Date.now());
    const onCompleteRef = useRef(onComplete);
    const completadoRef = useRef(false);
    const [transcurrido, setTranscurrido] = useState(0);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const actualizarProgreso = () => {
            const siguienteTranscurrido = Math.min(
                Date.now() - inicioRef.current,
                DURACION_TRANSICION_MS
            );

            setTranscurrido(siguienteTranscurrido);

            if (siguienteTranscurrido >= DURACION_TRANSICION_MS && !completadoRef.current) {
                completadoRef.current = true;
                onCompleteRef.current?.();
            }
        };

        actualizarProgreso();
        const intervalo = window.setInterval(actualizarProgreso, 100);

        return () => window.clearInterval(intervalo);
    }, []);

    const progreso = (transcurrido / DURACION_TRANSICION_MS) * 100;

    return (
        <Stack spacing={0.25} alignItems="center" sx={{ minWidth: 92 }}>
            <Checkbox
                checked
                size="small"
                sx={{ p: 0 }}
                onChange={(event) => {
                    if (!event.target.checked) onCancel?.();
                }}
                inputProps={{ 'aria-label': 'Pedido entregado; moviendo a la lista de enviados' }}
            />
            <LinearProgress
                variant="determinate"
                value={progreso}
                sx={{ width: '70%', height: 4, borderRadius: 2 }}
            />
        </Stack>
    );
}
