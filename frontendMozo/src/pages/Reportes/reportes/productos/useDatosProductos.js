import { useMemo } from 'react';

function buscarProductoEnCatalogo(productos, item) {
    const idProd = item.idProducto;
    if (idProd != null && idProd !== '') {
        const porId = productos.find(prod => String(prod.id) === String(idProd));
        if (porId) return porId;
    }
}

export const useDatosProductos = (visitasFiltradas, productos, categorias) => {
    return useMemo(() => {
        const productosVendidos = {};

        const listaProductos = (v) => v.productosConsumidos ?? v.productos ?? [];
        visitasFiltradas.forEach(v => {
            listaProductos(v).forEach(p => {
                const nombreProd = p.nombre ?? p.nombreProducto ?? '';
                const key = p.idProducto ?? (nombreProd || `key-${nombreProd}`);
                if (!productosVendidos[key]) {
                    const producto = buscarProductoEnCatalogo(productos, p);
                    productosVendidos[key] = {
                        nombre: producto ? producto.nombre : nombreProd,
                        cantidad: 0,
                        ingresos: 0,
                        costo: 0,
                        idProducto: p.idProducto
                    };
                }
                productosVendidos[key].cantidad += 1;
                productosVendidos[key].ingresos += p.precio;
                const producto = buscarProductoEnCatalogo(productos, p);
                const costUnit = producto?.costo;
                if (producto && costUnit != null) {
                    productosVendidos[key].costo += Number(costUnit);
                }
            });
        });

        const productosArray = Object.values(productosVendidos).map(p => ({
            ...p,
            margen: p.ingresos - p.costo,
            rentabilidad: p.costo > 0 ? ((p.ingresos - p.costo) / p.costo) * 100 : 0
        }));

        const porCategoria = {};
        productosArray.forEach(p => {
            const producto = buscarProductoEnCatalogo(productos, p);
            if (producto) {
                const nombreCategoria = (producto.categorias?.length > 0) ? producto.categorias[0] : 'Sin categoría';
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
