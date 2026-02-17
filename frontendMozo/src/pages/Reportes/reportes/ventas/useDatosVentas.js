import { useMemo } from 'react';

/**
 * Calcula los datos para gráficos del reporte de ventas.
 * @param {Array} visitasFiltradas - Visitas ya filtradas por fecha, mesa, etc.
 * @param {Array} tipoPagos - Catálogo de tipos de pago
 * @returns {Object} datosVentas (porFecha, porHora, porDiaSemana, acumuladas, porTipoPago)
 */
export const useDatosVentas = (visitasFiltradas, tipoPagos) => {
    return useMemo(() => {
        // Por fecha
        const porFecha = {};
        visitasFiltradas.forEach(v => {
            const fecha = new Date(v.fechaHora).toISOString().split('T')[0];
            porFecha[fecha] = (porFecha[fecha] || 0) + (v.total || 0);
        });
        const ventasPorFecha = Object.entries(porFecha)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([fecha, total]) => ({ fecha, total }));

        // Por hora
        const porHora = {};
        visitasFiltradas.forEach(v => {
            const hora = new Date(v.fechaHora).getHours();
            porHora[hora] = (porHora[hora] || 0) + (v.total || 0);
        });
        const ventasPorHora = Array.from({ length: 24 }, (_, i) => ({
            hora: `${i.toString().padStart(2, '0')}:00`,
            total: porHora[i] || 0
        }));

        // Por día de la semana
        const porDiaSemana = [0, 0, 0, 0, 0, 0, 0];
        visitasFiltradas.forEach(v => {
            const dia = new Date(v.fechaHora).getDay();
            porDiaSemana[dia] += (v.total || 0);
        });
        const ventasPorDiaSemana = [
            'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
        ].map((dia, index) => ({ dia, total: porDiaSemana[index] }));

        // Acumulado
        let acumulado = 0;
        const ventasAcumuladas = ventasPorFecha.map(({ fecha, total }) => {
            acumulado += total;
            return { fecha, total: acumulado };
        });

        // Por tipo de pago
        const porTipoPago = {};
        visitasFiltradas.forEach(v => {
            (v.pagos ?? []).forEach(p => {
                const tipoPago = tipoPagos.find(tp => String(tp.id) === String(p.idTipoPago));
                const nombre = tipoPago ? tipoPago.nombre : `Tipo ${p.idTipoPago}`;
                porTipoPago[nombre] = (porTipoPago[nombre] || 0) + (p.monto ?? 0);
            });
        });
        const ventasPorTipoPago = Object.entries(porTipoPago).map(([nombre, total]) => ({
            nombre,
            total
        }));

        return {
            porFecha: ventasPorFecha,
            porHora: ventasPorHora,
            porDiaSemana: ventasPorDiaSemana,
            acumuladas: ventasAcumuladas,
            porTipoPago: ventasPorTipoPago
        };
    }, [visitasFiltradas, tipoPagos]);
};
