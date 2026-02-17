import { useMemo } from 'react';

/**
 * Calcula los datos para el reporte de rentabilidad.
 * @param {Array} visitasFiltradas - Visitas ya filtradas
 * @param {Array} productos - Catálogo de productos
 * @param {Object} datosProductos - Salida de useDatosProductos (todos, porCategoria)
 * @returns {Object} datosRentabilidad (totalIngresos, totalCostos, margenTotal, margenPorcentaje, productos, categorias)
 */
export const useDatosRentabilidad = (visitasFiltradas, productos, datosProductos) => {
    return useMemo(() => {
        const totalIngresos = visitasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0);

        const totalCostos = visitasFiltradas.reduce((sum, v) => {
            const costoVisita = (v.productos ?? []).reduce((prodSum, p) => {
                const producto = productos.find(prod => (prod.nombre ?? prod.Nombre) === (p.nombreProducto ?? p.NombreProducto));
                const costo = producto?.costo ?? producto?.CostoProduccion;
                if (costo != null) {
                    return prodSum + (Number(costo) * (p.cantidad || 0));
                }
                return prodSum;
            }, 0);
            return sum + costoVisita;
        }, 0);

        const margenTotal = totalIngresos - totalCostos;
        const margenPorcentaje = totalIngresos > 0 ? (margenTotal / totalIngresos) * 100 : 0;

        return {
            totalIngresos,
            totalCostos,
            margenTotal,
            margenPorcentaje,
            productos: (datosProductos?.todos ?? []).map(p => ({
                nombre: p.nombre,
                ingresos: p.ingresos,
                costo: p.costo,
                margen: p.margen,
                margenPorcentaje: p.ingresos > 0 ? (p.margen / p.ingresos) * 100 : 0
            })),
            categorias: (datosProductos?.porCategoria ?? []).map(c => ({
                nombre: c.nombre,
                ingresos: c.ingresos,
                costo: c.costo,
                margen: c.margen,
                margenPorcentaje: c.ingresos > 0 ? (c.margen / c.ingresos) * 100 : 0
            }))
        };
    }, [visitasFiltradas, productos, datosProductos]);
};
