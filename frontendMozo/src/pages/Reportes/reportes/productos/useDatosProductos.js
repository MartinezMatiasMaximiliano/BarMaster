import { useMemo } from 'react';

/**
 * Calcula los datos para gráficos del reporte de productos.
 * @param {Array} visitasFiltradas - Visitas ya filtradas
 * @param {Array} productos - Catálogo de productos
 * @param {Array} categorias - Catálogo de categorías
 * @returns {Object} datosProductos (todos, masVendidos, menosVendidos, masRentables, porCategoria)
 */
export const useDatosProductos = (visitasFiltradas, productos, categorias) => {
    return useMemo(() => {
        const productosVendidos = {};

        visitasFiltradas.forEach(v => {
            (v.productos ?? []).forEach(p => {
                const nombreProd = p.nombreProducto ?? p.NombreProducto ?? '';
                if (!nombreProd) return;
                if (!productosVendidos[nombreProd]) {
                    productosVendidos[nombreProd] = {
                        nombre: nombreProd,
                        cantidad: 0,
                        ingresos: 0,
                        costo: 0
                    };
                }
                productosVendidos[nombreProd].cantidad += (p.cantidad || 0);
                productosVendidos[nombreProd].ingresos += (p.precioTotal ?? p.precio ?? p.Precio ?? 0);
                const producto = productos.find(prod => (prod.nombre ?? prod.Nombre) === nombreProd);
                const costUnit = producto?.costo ?? producto?.CostoProduccion;
                if (producto && costUnit != null) {
                    productosVendidos[nombreProd].costo += Number(costUnit) * (p.cantidad || 0);
                }
            });
        });

        const productosArray = Object.values(productosVendidos).map(p => ({
            ...p,
            margen: p.ingresos - p.costo,
            rentabilidad: p.costo > 0 ? ((p.ingresos - p.costo) / p.costo) * 100 : 0
        }));

        // Por categoría
        const porCategoria = {};
        productosArray.forEach(p => {
            const producto = productos.find(prod => (prod.nombre ?? prod.Nombre) === (p.nombre ?? p.Nombre));
            if (producto) {
                const idCat = producto.idCategoria ?? producto.IdCategoria;
                const categoria = categorias.find(c => String(c.id ?? c.Id) === String(idCat));
                const nombreCategoria = categoria ? (categoria.nombre ?? categoria.Nombre) : 'Sin categoría';
                if (!porCategoria[nombreCategoria]) {
                    porCategoria[nombreCategoria] = {
                        nombre: nombreCategoria,
                        cantidad: 0,
                        ingresos: 0,
                        costo: 0
                    };
                }
                porCategoria[nombreCategoria].cantidad += p.cantidad;
                porCategoria[nombreCategoria].ingresos += p.ingresos;
                porCategoria[nombreCategoria].costo += p.costo;
            }
        });
        const productosPorCategoria = Object.values(porCategoria).map(c => ({
            ...c,
            margen: c.ingresos - c.costo
        }));

        return {
            todos: [...productosArray].sort((a, b) => b.cantidad - a.cantidad),
            masVendidos: [...productosArray].sort((a, b) => b.cantidad - a.cantidad).slice(0, 10),
            menosVendidos: [...productosArray].sort((a, b) => a.cantidad - b.cantidad).slice(0, 10),
            masRentables: [...productosArray].sort((a, b) => b.margen - a.margen).slice(0, 10),
            porCategoria: productosPorCategoria
        };
    }, [visitasFiltradas, productos, categorias]);
};
