// hooks/useMesas.js
import { useState, useEffect } from 'react';
import { BuscarTodasLasMesas } from '../../../API/APIMesas';
import { normalizarMesa } from '../utils/mesaHelpers';

/**
 * Hook para cargar y gestionar las mesas
 * @returns {Object} { mesas, cargando }
 */
export const useMesas = () => {
    const [mesas, setMesas] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarMesas = async () => {
            if (!localStorage.getItem('token')) {
                return;
            }

            try {
                setCargando(true);
                const mesasData = await BuscarTodasLasMesas();
                
                if (Array.isArray(mesasData) && mesasData.length > 0) {
                    const mesasNormalizadas = mesasData.map(normalizarMesa);
                    setMesas(mesasNormalizadas);
                } else {
                    setMesas([]);
                }
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

