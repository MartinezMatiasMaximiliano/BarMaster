import { useCallback, useEffect, useRef, useState } from 'react';

export const useAutoSubmitPedidos = ({
    activo,
    duracionMs = 5000,
    bloqueado = false,
    resetKey,
    onSubmit
}) => {
    const [paused, setPaused] = useState(false);
    const [restartKey, setRestartKey] = useState(0);
    const onSubmitRef = useRef(onSubmit);

    useEffect(() => {
        onSubmitRef.current = onSubmit;
    }, [onSubmit]);

    useEffect(() => {
        if (!activo || bloqueado || paused) return undefined;

        const timeoutId = window.setTimeout(() => {
            onSubmitRef.current?.();
        }, duracionMs);

        return () => window.clearTimeout(timeoutId);
    }, [activo, bloqueado, paused, duracionMs, resetKey, restartKey]);

    const pause = useCallback(() => {
        setPaused(true);
    }, []);

    const resume = useCallback(() => {
        setPaused(false);
    }, []);

    const reset = useCallback(() => {
        setPaused(false);
        setRestartKey(key => key + 1);
    }, []);

    const restart = useCallback(() => {
        setRestartKey(key => key + 1);
    }, []);

    return {
        pause,
        resume,
        reset,
        restart
    };
};
