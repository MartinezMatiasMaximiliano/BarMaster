export const obtenerFechaActual = () => {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0'); // Añade '0' si es necesario
    const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Mes en base 0
    const anio = ahora.getFullYear();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
}

const agruparProductos = (items) => {
    return items.reduce((acc, item) => {
        const existingItem = acc.find(
            i => i.nombreProducto === item.nombreProducto && i.indicaciones === item.indicaciones
        );

        if (existingItem) {
            existingItem.cantidad += 1; // Suma 1 a la cantidad
            existingItem.precio += item.precio; // Acumula el precio total
        } else {
            acc.push({ ...item, cantidad: 1 }); // Inicializa la cantidad en 1
        }
        return acc;
    }, []);
};

export const calcularTotal = (items) => {
    return items.reduce((sum, item) => sum + item.precio, 0);
};

export const crearTicket = (items, numeroMesa) => {
    const groupedItems = agruparProductos(items);
    const newTotal = calcularTotal(items);
    return { items: groupedItems, total: newTotal, numeroMesa: numeroMesa };
}

export function CrearNotificacion(numeroMesa, tipoMensaje) {

    var mensaje = ''
    switch (tipoMensaje) {
        case 'PedirCuenta':
            mensaje = "La mesa " + numeroMesa + " solicita la cuenta total."
            break;
        case 'RealizaPedido':
            mensaje = "La mesa " + numeroMesa + " ha hecho un pedido."
            break;
        case 'LlamarMozo':
            mensaje = "La mesa " + numeroMesa + " solicita su atencion."
            break;
        case 'SepararCuenta':
            mensaje = "La mesa " + numeroMesa + " solicita separar la cuenta."
            break;
    }

    return {
        IdMesa: numeroMesa,
        Mensaje: mensaje,
        Fecha: obtenerFechaActual()
    };
}

export function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11
    const anio = fecha.getFullYear();

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

