import { useCallback, useEffect, useState } from 'react';
import { obtenerImpresoras, obtenerImpresorasLocales } from '../../../services/impresion/apiImpresion';
import { normalizarErrorQz } from '../../../services/impresion/erroresQz';
import { esImpresoraPermitida } from '../../../services/impresion/impresorasQz';

export function useInventarioImpresoras(onActualizadas) {
    const [locales, setLocales] = useState([]);
    const [registradas, setRegistradas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const cargarRegistradas = useCallback(async () => {
        setCargando(true); setError(null);
        try { setRegistradas(await obtenerImpresoras()); onActualizadas?.(); }
        catch (e) { setError(normalizarErrorQz(e).mensaje); }
        finally { setCargando(false); }
    }, [onActualizadas]);
    const cargarLocales = useCallback(async () => {
        try { setLocales((await obtenerImpresorasLocales()).filter(x => esImpresoraPermitida(x.nombreSistema))); }
        catch (e) { setError(normalizarErrorQz(e).mensaje); }
    }, []);
    useEffect(() => { cargarRegistradas(); cargarLocales(); }, [cargarRegistradas, cargarLocales]);
    return { locales, setLocales, registradas, setRegistradas, cargando, error, cargarRegistradas, cargarLocales };
}
