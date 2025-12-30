// hooks/usePlanos.js
import { useState, useEffect } from 'react';
import { BuscarTodosLosPlanos } from '../../../API/APIPlanos';
import { normalizarPlano } from '../utils/mesaHelpers';

/**
 * Hook para cargar y gestionar los planos
 * @returns {Object} { planos, planoSeleccionado, setPlanoSeleccionado, cargando }
 */
export const usePlanos = () => {
    const [planos, setPlanos] = useState([]);
    const [planoSeleccionado, setPlanoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarPlanos = async () => {
            if (!localStorage.getItem('token')) {
                return;
            }

            try {
                setCargando(true);
                const data = await BuscarTodosLosPlanos();
                
                if (Array.isArray(data) && data.length > 0) {
                    const planosNormalizados = data.map(normalizarPlano);
                    setPlanos(planosNormalizados);
                    
                    // Seleccionar automáticamente el primer plano
                    if (planosNormalizados.length > 0) {
                        setPlanoSeleccionado(planosNormalizados[0].id);
                    }
                } else {
                    setPlanos([]);
                }
            } catch (error) {
                console.error('Error al cargar planos:', error);
                setPlanos([]);
            } finally {
                setCargando(false);
            }
        };

        cargarPlanos();
    }, []);

    return { planos, planoSeleccionado, setPlanoSeleccionado, cargando };
};

