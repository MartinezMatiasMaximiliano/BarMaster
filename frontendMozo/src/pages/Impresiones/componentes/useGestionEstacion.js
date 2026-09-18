import { useCallback, useEffect, useState } from 'react';
import { darAltaEstacionActual, obtenerEstacionActual } from '../../../services/impresion/apiImpresion';
import { normalizarErrorQz } from '../../../services/impresion/erroresQz';

export function useGestionEstacion() {
    const [nombre, setNombre] = useState('Caja principal');
    const [nombreGuardado, setNombreGuardado] = useState('Caja principal');
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const cargar = useCallback(async () => {
        setCargando(true); setErrorCarga(null);
        try {
            const estacion = await obtenerEstacionActual();
            setNombre(estacion.nombre); setNombreGuardado(estacion.nombre);
            return estacion;
        } catch (error) { setErrorCarga(normalizarErrorQz(error).mensaje); return null; }
        finally { setCargando(false); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);
    const guardar = useCallback(async () => {
        const estacion = await darAltaEstacionActual(nombre.trim());
        setNombre(estacion.nombre); setNombreGuardado(estacion.nombre);
        return estacion;
    }, [nombre]);
    return { nombre, setNombre, nombreGuardado, setNombreGuardado, cargando, errorCarga, cargar, guardar };
}
