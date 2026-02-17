import { useMemo } from 'react';

/**
 * Calcula los datos para gráficos del reporte de mesas.
 * @param {Array} visitasFiltradas - Visitas ya filtradas
 * @returns {Object} datosMesas (todas, porIngresos, porOcupacion)
 */
export const useDatosMesas = (visitasFiltradas) => {
    return useMemo(() => {
        const mesasData = {};

        visitasFiltradas.forEach(v => {
            if (v.mesa) {
                const idMesa = v.mesa.id;
                if (!mesasData[idMesa]) {
                    mesasData[idMesa] = {
                        idMesa,
                        nombre: v.mesa.nombre,
                        ingresos: 0,
                        cantidadVisitas: 0
                    };
                }
                mesasData[idMesa].ingresos += (v.total || 0);
                mesasData[idMesa].cantidadVisitas += 1;
            }
        });

        const mesasArray = Object.values(mesasData);

        return {
            todas: [...mesasArray].sort((a, b) => b.ingresos - a.ingresos),
            porIngresos: [...mesasArray].sort((a, b) => b.ingresos - a.ingresos),
            porOcupacion: [...mesasArray].sort((a, b) => b.cantidadVisitas - a.cantidadVisitas)
        };
    }, [visitasFiltradas]);
};
