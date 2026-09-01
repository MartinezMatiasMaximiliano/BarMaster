/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { connectQz, disconnectQz, getQzVersion } from '../services/printing/qzConnection';
import { findPrinters } from '../services/printing/qzPrinters';
import { normalizeQzError } from '../services/printing/qzErrors';

const PrintingContext = createContext(null);

export function PrintingProvider({ children }) {
    const [state, setState] = useState('idle');
    const [version, setVersion] = useState(null);
    const [printers, setPrinters] = useState([]);
    const [lastError, setLastError] = useState(null);

    const connect = useCallback(async () => {
        setState('connecting');
        setLastError(null);
        try {
            await connectQz();
            const detectedVersion = await getQzVersion();
            setVersion(detectedVersion);
            setState('connected');
            return detectedVersion;
        } catch (error) {
            const normalized = normalizeQzError(error);
            setLastError(normalized);
            setState('unavailable');
            throw normalized;
        }
    }, []);

    const refreshPrinters = useCallback(async () => {
        try {
            const detected = await findPrinters();
            setPrinters(detected);
            setState('connected');
            return detected;
        } catch (error) {
            const normalized = normalizeQzError(error);
            setLastError(normalized);
            setState('unavailable');
            throw normalized;
        }
    }, []);

    const disconnect = useCallback(async () => {
        await disconnectQz();
        setState('idle');
        setVersion(null);
        setPrinters([]);
    }, []);

    const value = useMemo(() => ({ state, version, printers, lastError, connect, disconnect, refreshPrinters }),
        [state, version, printers, lastError, connect, disconnect, refreshPrinters]);
    return <PrintingContext.Provider value={value}>{children}</PrintingContext.Provider>;
}

export function usePrinting() {
    const context = useContext(PrintingContext);
    if (!context) throw new Error('usePrinting debe utilizarse dentro de PrintingProvider.');
    return context;
}
