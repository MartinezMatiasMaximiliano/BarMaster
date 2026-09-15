import { AgregarProductosAVisita } from '../API/APIVisitas';
const guid = (valor) => typeof valor === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(valor);

export async function registrarPedidoRecibido(pedido, numeroMesa, visitas, menu) {
    const visita = visitas.find(v => String(v.numeroMesa ?? v.mesa?.numero) === String(numeroMesa));
    const idVisita = visita?.id ?? visita?.Id;
    if (!guid(idVisita)) throw new Error('No se pudo identificar una visita actual para el pedido recibido.');
    if (!Array.isArray(pedido) || pedido.length === 0) throw new Error('El pedido recibido está vacío.');
    const productos = pedido.map(item => {
        const id = item.idProducto ?? item.IdProducto ?? item.id ?? item.Id;
        const cantidad = Number(item.cantidad ?? item.Cantidad ?? 1);
        if (!guid(id) || !menu.some(p => (p.id ?? p.Id)?.toLowerCase() === id.toLowerCase()))
            throw new Error('El pedido contiene identificadores antiguos o productos incompatibles. No se cargó el pedido.');
        if (!Number.isSafeInteger(cantidad) || cantidad <= 0) throw new Error('La cantidad recibida es inválida.');
        return { IdProducto: id, Cantidad: cantidad, Detalles: item.detalles ?? item.indicaciones ?? item.Indicaciones ?? '' };
    });
    return AgregarProductosAVisita(idVisita, productos);
}
