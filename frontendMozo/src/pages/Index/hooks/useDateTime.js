import { useState, useEffect } from 'react';

export const useDateTime = () => {
    const [fechaHora, setFechaHora] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setFechaHora(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return fechaHora;
};

