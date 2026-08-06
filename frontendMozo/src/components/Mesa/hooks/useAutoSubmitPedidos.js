import { useCallback, useEffect, useRef, useState } from 'react';

const AUTO_SUBMIT_OK_MS = 450;

export const useAutoSubmitPedidos = ({
    activo,
    duracionMs = 5000,
    bloqueado = false,
    resetKey,
    onSubmit
}) => {
    const [remainingMs, setRemainingMs] = useState(0);
    const [paused, setPaused] = useState(false);
    const [complete, setComplete] = useState(false);
    const onSubmitRef = useRef(onSubmit);

    useEffect(() => {
        onSubmitRef.current = onSubmit;
    }, [onSubmit]);

    useEffect(() => {
        setComplete(false);
    }, [resetKey]);

    useEffect(() => {
        if (!activo || bloqueado || paused) {
            setRemainingMs(0);
            return undefined;
        }

        const startedAt = Date.now();
        setRemainingMs(duracionMs);

        const intervalId = window.setInterval(() => {
            const elapsed = Date.now() - startedAt;
            setRemainingMs(Math.max(duracionMs - elapsed, 0));
        }, 100);

        let okTimeoutId = null;
        const timeoutId = window.setTimeout(() => {
            setRemainingMs(0);
            setComplete(true);
            okTimeoutId = window.setTimeout(() => {
                onSubmitRef.current?.();
            }, AUTO_SUBMIT_OK_MS);
        }, duracionMs);

        return () => {
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
            if (okTimeoutId) {
                window.clearTimeout(okTimeoutId);
            }
        };
    }, [activo, bloqueado, paused, duracionMs, resetKey]);

    const pause = useCallback(() => {
        setPaused(true);
        setComplete(false);
    }, []);

    const resume = useCallback(() => {
        setPaused(false);
    }, []);

    const reset = useCallback(() => {
        setRemainingMs(0);
        setPaused(false);
        setComplete(false);
    }, []);

    return {
        remainingMs,
        paused,
        complete,
        pause,
        resume,
        reset
    };
};
