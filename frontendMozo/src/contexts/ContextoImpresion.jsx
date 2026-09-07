/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { conectarQz, desconectarQz, obtenerVersionQz } from '../services/impresion/conexionQz';
import { buscarImpresoras } from '../services/impresion/impresorasQz';
import { normalizarErrorQz } from '../services/impresion/erroresQz';
import { iniciarTrabajadorImpresion, detenerTrabajadorImpresion } from '../services/impresion/trabajadorImpresion';

const ContextoImpresion = createContext(null);

export function ProveedorImpresion({ children }) {
    const [estado, establecerEstado] = useState('inactivo');
    const [version, establecerVersion] = useState(null);
    const [impresoras, establecerImpresoras] = useState([]);
    const [ultimoError, establecerUltimoError] = useState(null);

    useEffect(() => {
        iniciarTrabajadorImpresion();
        return () => detenerTrabajadorImpresion();
    }, []);

    const conectar = useCallback(async () => {
        establecerEstado('conectando');
        establecerUltimoError(null);
        try {
            await conectarQz();
            const versionDetectada = await obtenerVersionQz();
            establecerVersion(versionDetectada);
            establecerEstado('conectado');
            return versionDetectada;
        } catch (error) {
            const normalizado = normalizarErrorQz(error);
            establecerUltimoError(normalizado);
            establecerEstado('no_disponible');
            throw normalizado;
        }
    }, []);

    const actualizarImpresoras = useCallback(async () => {
        try {
            const detectadas = await buscarImpresoras();
            establecerImpresoras(detectadas);
            establecerEstado('conectado');
            return detectadas;
        } catch (error) {
            const normalizado = normalizarErrorQz(error);
            establecerUltimoError(normalizado);
            establecerEstado('no_disponible');
            throw normalizado;
        }
    }, []);

    const desconectar = useCallback(async () => {
        await desconectarQz();
        establecerEstado('inactivo');
        establecerVersion(null);
        establecerImpresoras([]);
    }, []);

    const valor = useMemo(() => ({ estado, version, impresoras, ultimoError, conectar, desconectar, actualizarImpresoras }),
        [estado, version, impresoras, ultimoError, conectar, desconectar, actualizarImpresoras]);
    return <ContextoImpresion.Provider value={valor}>{children}</ContextoImpresion.Provider>;
}

export function usarImpresion() {
    const context = useContext(ContextoImpresion);
    if (!context) throw new Error('usarImpresion debe utilizarse dentro de ProveedorImpresion.');
    return context;
}
