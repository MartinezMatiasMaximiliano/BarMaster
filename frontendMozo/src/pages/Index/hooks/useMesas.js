import { useState, useEffect } from 'react';
import { BuscarTodasLasMesas } from '../../../API/APIMesas';

/**
 * Hook para obtener todas las mesas desde la API
 * Ignora el plano al que pertenecen - muestra TODAS las mesas
 * @returns {Object} { mesas, cargando }
 */
export const useMesas = () => {
    const [mesas, setMesas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarMesas = async () => {
            setCargando(true);
            try {
                const datos = await BuscarTodasLasMesas();
                setMesas(Array.isArray(datos) ? datos : []);
            } catch (error) {
                console.error('Error al cargar mesas:', error);
                setMesas([]);
            } finally {
                setCargando(false);
            }
        };

        cargarMesas();
    }, []);

    return { mesas, cargando };
};
