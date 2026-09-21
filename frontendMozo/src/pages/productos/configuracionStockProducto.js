export function agregarConfiguracionStock(productos, configuraciones) {
    const stockPorProducto = new Map(
        (Array.isArray(configuraciones) ? configuraciones : [])
            .map((stock) => [String(stock.idProducto), stock]),
    );

    return (Array.isArray(productos) ? productos : []).map((producto) => {
        const stock = stockPorProducto.get(String(producto.id));
        if (!stock) {
            return {
                ...producto,
                stockConfigurado: false,
                controlaStock: false,
                enviarAlerta: false,
                cantidadMinima: 0,
            };
        }

        return {
            ...producto,
            stockConfigurado: true,
            controlaStock: Boolean(stock.controlaStock),
            enviarAlerta: Boolean(stock.enviarAlerta),
            cantidadMinima: stock.cantidadMinima ?? 0,
            cantidadActual: stock.cantidadActual ?? 0,
        };
    });
}

export function crearConfiguracionStockEdicion(datos) {
    const controlaStock = Boolean(datos.controlaStock);
    return {
        controlaStock,
        enviarAlerta: controlaStock && Boolean(datos.enviarAlerta),
        cantidadMinima: Number(datos.cantidadMinima ?? 0),
        cantidadInicial: datos.stockConfigurado || !controlaStock
            ? null
            : Number(datos.cantidadInicial ?? 0),
    };
}
