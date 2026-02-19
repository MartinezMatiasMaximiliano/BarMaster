import { useMemo } from 'react';

/**
 * Calcula los datos para gráficos del reporte de mesas.
 * Usa idMesa/numeroMesa de cada visita (API devuelve IdMesa, NumeroMesa; no objeto mesa).
 * @param {Array} visitasFiltradas - Visitas ya filtradas
 * @returns {Object} datosMesas (todas, porIngresos, porOcupacion, totalGeneral)
 */
export const useDatosMesas = (visitasFiltradas) => {
    return useMemo(() => {
        const mesasData = {};
        let totalGeneral = 0;

        (visitasFiltradas ?? []).forEach(v => {
            const idMesa = v.idMesa ?? v.IdMesa;
            if (idMesa == null) return;

            const nombre = v.numeroMesa ?? v.NumeroMesa ?? v.mesa?.nombre ?? `Mesa ${idMesa}`;
            const totalVisita = v.total ?? 0;

            if (!mesasData[idMesa]) {
                mesasData[idMesa] = {
                    idMesa,
                    nombre,
                    ingresos: 0,
                    cantidadVisitas: 0
                };
            }
            mesasData[idMesa].ingresos += totalVisita;
            mesasData[idMesa].cantidadVisitas += 1;
            totalGeneral += totalVisita;
        });

        const mesasArray = Object.values(mesasData).map(m => ({
            ...m,
            promedioPorVisita: m.cantidadVisitas > 0 ? m.ingresos / m.cantidadVisitas : 0
        }));

        return {
            todas: [...mesasArray].sort((a, b) => b.ingresos - a.ingresos),
            porIngresos: [...mesasArray].sort((a, b) => b.ingresos - a.ingresos),
            porOcupacion: [...mesasArray].sort((a, b) => b.cantidadVisitas - a.cantidadVisitas),
            totalGeneral
        };
    }, [visitasFiltradas]);
};
