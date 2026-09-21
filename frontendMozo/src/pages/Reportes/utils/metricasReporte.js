export function calcularMargenGanancia(visitas, productos) {
    return visitas.reduce((total, visita) => {
        const margenVisita = (visita.productos ?? []).reduce((subtotal, item) => {
            const producto = productos.find((catalogo) => (
                item.idProducto != null && String(catalogo.id) === String(item.idProducto)
            )) ?? productos.find((catalogo) => catalogo.nombre === (item.nombreProducto ?? item.nombre));
            const costoUnitario = producto?.costoProduccion ?? producto?.CostoProduccion ?? producto?.costo;

            if (costoUnitario == null) return subtotal;

            const cantidad = Number(item.cantidad ?? 0);
            const ingreso = Number(item.precioTotal ?? 0);
            return subtotal + ingreso - (Number(costoUnitario) * cantidad);
        }, 0);

        return total + margenVisita;
    }, 0);
}
