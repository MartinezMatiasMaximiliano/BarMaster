import { useMemo } from 'react';

/**
 * Obtiene inicio de semana (lunes) para una fecha.
 */
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Formatea período para etiqueta: "Sem 1" o "Ene 2025".
 */
function formatPeriodoLabel(key, porMes) {
    if (porMes) {
        const [y, m] = key.split('-').map(Number);
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${meses[m - 1]} ${y}`;
    }
    const parts = key.split('-');
    return parts.length >= 2 ? `Sem ${parts[1]}` : key;
}

/**
 * Calcula los datos para gráficos del reporte de mozos.
 * Solo se consideran visitas con Origen "Local" (mozos no participan en Delivery/TakeAway).
 * @param {Array} visitasFiltradas - Visitas ya filtradas
 * @param {Array} productos - Catálogo de productos (para costo/margen)
 * @returns {Object} datosMozos (todos, porVentas, porVisitas, totalesPeriodo, porPeriodo)
 */
export const useDatosMozos = (visitasFiltradas, productos = []) => {
    return useMemo(() => {
        const visitasLocal = (visitasFiltradas ?? []).filter(
            v => String(v.origen).toLowerCase() === 'local'
        );
        const mozosData = {};

        visitasLocal.forEach(v => {
            const mozo = v.mozo;
            const idMozo = mozo?.id;
            if (idMozo && mozo) {
                const nombres = mozo.nombres;
                const apellido = mozo.apellido;
                const nombreCompleto = `${nombres} ${apellido}`.trim() || `Mozo ${idMozo}`;
                if (!mozosData[idMozo]) {
                    mozosData[idMozo] = {
                        idMozo,
                        nombre: nombres,
                        apellido,
                        nombreCompleto,
                        ventas: 0,
                        cantidadVisitas: 0,
                        totalItems: 0,
                        margenGanancia: 0
                    };
                }
                const cantidadItems = v.productos?.length ?? 0;
                mozosData[idMozo].ventas += (v.total || 0);
                mozosData[idMozo].cantidadVisitas += 1;
                mozosData[idMozo].totalItems += cantidadItems;

                const prods = v.productosConsumidos;
                const margenVisita = prods.reduce((sum, p) => {
                    const nombreProd = p.nombre;
                    const producto = productos.find(prod => prod.nombre === nombreProd);
                    const costoUnit = producto?.costo;
                    if (producto != null && costoUnit != null) {
                        const costoTotal = Number(costoUnit);
                        return sum + ((p.precio) - costoTotal);
                    }
                    return sum;
                }, 0);
                mozosData[idMozo].margenGanancia += margenVisita;
            }
        });

        const totalVentasPeriodo = visitasLocal.reduce((s, v) => s + (v.total || 0), 0);
        const cantidadVisitasPeriodo = visitasLocal.length;
        const promedioLocal = cantidadVisitasPeriodo > 0 ? totalVentasPeriodo / cantidadVisitasPeriodo : 0;

        const mozosArray = Object.values(mozosData).map(m => {
            const promedio = m.cantidadVisitas > 0 ? m.ventas / m.cantidadVisitas : 0;
            return {
                ...m,
                promedio,
                promedioProductosPorVisita: m.cantidadVisitas > 0 ? m.totalItems / m.cantidadVisitas : 0,
                pctParticipacionVentas: totalVentasPeriodo > 0 ? (m.ventas / totalVentasPeriodo) * 100 : 0,
                pctVsPromedioLocal: promedioLocal > 0 ? (promedio / promedioLocal) * 100 : 0
            };
        });

        const todos = [...mozosArray].sort((a, b) => b.ventas - a.ventas);
        const porVentas = [...mozosArray].sort((a, b) => b.ventas - a.ventas);
        const porVisitas = [...mozosArray].sort((a, b) => b.cantidadVisitas - a.cantidadVisitas);

        const topMozos = porVentas.slice(0, 10);
        const porPeriodo = [];

        if (visitasLocal.length > 0 && topMozos.length > 0) {
            const fechas = visitasLocal.map(v => new Date(v.fechaHora || v.FechaHora));
            const minDate = new Date(Math.min(...fechas));
            const maxDate = new Date(Math.max(...fechas));
            const semanasRango = (maxDate - minDate) / (7 * 24 * 60 * 60 * 1000);
            const porMes = semanasRango > 12;

            const periodosMap = {};

            visitasLocal.forEach(v => {
                const mozo = v.mozo ?? v.mesa?.mozo;
                const idMozo = mozo?.id ?? v.mesa?.idMozo;
                if (!idMozo || !topMozos.some(m => m.idMozo === idMozo)) return;

                const fecha = new Date(v.fechaHora || v.FechaHora);
                let key;
                if (porMes) {
                    key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                } else {
                    const start = getStartOfWeek(fecha);
                    const weekNum = Math.floor((start - new Date(start.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)) + 1;
                    key = `${fecha.getFullYear()}-${String(weekNum).padStart(2, '0')}`;
                }
                if (!periodosMap[key]) periodosMap[key] = { key, totales: {} };
                const mozoEntry = topMozos.find(m => m.idMozo === idMozo);
                const nombreMozo = mozoEntry?.nombreCompleto ?? idMozo;
                if (!periodosMap[key].totales[nombreMozo]) periodosMap[key].totales[nombreMozo] = 0;
                periodosMap[key].totales[nombreMozo] += (v.total || 0);
            });

            const keysOrdenados = Object.keys(periodosMap).sort();
            keysOrdenados.forEach(key => {
                const item = periodosMap[key];
                const row = {
                    periodo: key,
                    periodoLabel: formatPeriodoLabel(key, porMes)
                };
                topMozos.forEach(m => {
                    row[m.nombreCompleto] = item.totales[m.nombreCompleto] ?? 0;
                });
                porPeriodo.push(row);
            });
        }

        return {
            todos,
            porVentas,
            porVisitas,
            totalesPeriodo: { totalVentasPeriodo, promedioLocal },
            porPeriodo
        };
    }, [visitasFiltradas, productos]);
};
