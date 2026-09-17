import { useCallback, useState } from 'react';
import { BuscarMesasDisponibles } from '../../API/APIReservas';

export function useDisponibilidadMesas() {
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const consultar = useCallback(async fechaHora => {
        setCargando(true); setError('');
        try {
            const mesas = await BuscarMesasDisponibles(fechaHora);
            setResultado({ fechaHora, mesas });
            return mesas;
        } catch (e) {
            setError(e.message || 'No se pudo consultar la disponibilidad.');
            throw e;
        } finally { setCargando(false); }
    }, []);
    const limpiar = useCallback(() => { setResultado(null); setError(''); }, []);
    return { resultado, setResultado, cargando, error, setError, consultar, limpiar };
}
