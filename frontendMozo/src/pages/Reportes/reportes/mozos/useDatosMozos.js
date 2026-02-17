import { useMemo } from 'react';

/**
 * Calcula los datos para gráficos del reporte de mozos.
 * @param {Array} visitasFiltradas - Visitas ya filtradas
 * @returns {Object} datosMozos (todos, porVentas, porVisitas)
 */
export const useDatosMozos = (visitasFiltradas) => {
    return useMemo(() => {
        const mozosData = {};

        visitasFiltradas.forEach(v => {
            if (v.mesa && v.mesa.idMozo && v.mesa.mozo) {
                const idMozo = v.mesa.idMozo;
                const mozo = v.mesa.mozo;
                if (!mozosData[idMozo]) {
                    mozosData[idMozo] = {
                        idMozo,
                        nombre: mozo.nombres || '',
                        apellido: mozo.apellido || '',
                        nombreCompleto: `${mozo.nombres || ''} ${mozo.apellido || ''}`.trim(),
                        ventas: 0,
                        cantidadVisitas: 0
                    };
                }
                mozosData[idMozo].ventas += (v.total || 0);
                mozosData[idMozo].cantidadVisitas += 1;
            }
        });

        const mozosArray = Object.values(mozosData).map(m => ({
            ...m,
            promedio: m.cantidadVisitas > 0 ? m.ventas / m.cantidadVisitas : 0
        }));

        return {
            todos: [...mozosArray].sort((a, b) => b.ventas - a.ventas),
            porVentas: [...mozosArray].sort((a, b) => b.ventas - a.ventas),
            porVisitas: [...mozosArray].sort((a, b) => b.cantidadVisitas - a.cantidadVisitas)
        };
    }, [visitasFiltradas]);
};
