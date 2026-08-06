import api from '../services/axiosInstance';
import { construirError } from './APIError';
import { AgregarProductosAVisita, EliminarProductosVisita, ObtenerTodasLasVisitas } from './APIVisitas';
import { sendHubMessage } from '../connections/HubConnMozo';

export function normalizarDeliveryTakeaway(item) {
    const idTipoEnvio = item.idTipoEnvio ?? item.IdTipoEnvio ?? null;
    const productosRaw = item.productos ?? item.Productos ?? [];
    const productos = Array.isArray(productosRaw) ? productosRaw : [];
    const tipoEnvioRaw = item.tipoEnvio ?? item.TipoEnvio ?? null;
    const cadeteRaw = item.cadete ?? item.Cadete ?? null;
    const pagoRaw = item.pago ?? item.Pago ?? item.ultimoPago ?? item.UltimoPago ?? null;
    const tipoPagoRaw = pagoRaw?.tipoMovimientoCaja
        ?? pagoRaw?.TipoMovimientoCaja
        ?? pagoRaw?.metodoPago
        ?? pagoRaw?.MetodoPago
        ?? null;
    const precioEnvio = Number(item.precioEnvio ?? item.PrecioEnvio ?? tipoEnvioRaw?.precio ?? tipoEnvioRaw?.Precio ?? 0);

    return {
        id: item.id ?? item.Id,
        idVisita: item.idVisita ?? item.IdVisita ?? null,
        fechaHora: item.fechaHora ?? item.FechaHora ?? '',
        cliente: item.nombreCliente ?? item.NombreCliente ?? '-',
        direccion: item.direccion ?? item.Direccion ?? null,
        telefono: item.telefono ?? item.Telefono ?? null,
        indicaciones: item.indicaciones ?? item.Indicaciones ?? null,
        precioTotal: Number(item.precioTotal ?? item.PrecioTotal ?? 0),
        entregado: Boolean(item.entregado ?? item.Entregado ?? false),
        idTipoEnvio,
        tipoEnvio: tipoEnvioRaw ? {
            id: tipoEnvioRaw.id ?? tipoEnvioRaw.Id ?? idTipoEnvio,
            nombre: tipoEnvioRaw.nombre ?? tipoEnvioRaw.Nombre ?? '',
            precio: precioEnvio,
            vehiculo: tipoEnvioRaw.vehiculo ?? tipoEnvioRaw.Vehiculo ?? '',
        } : (idTipoEnvio != null ? {
            id: idTipoEnvio,
            nombre: '',
            precio: precioEnvio,
            vehiculo: '',
        } : null),
        cadete: cadeteRaw ? {
            id: cadeteRaw.id ?? cadeteRaw.Id ?? null,
            nombre: cadeteRaw.nombre ?? cadeteRaw.Nombre ?? '-',
            apellido: cadeteRaw.apellido ?? cadeteRaw.Apellido ?? '-',
            telefono: cadeteRaw.telefono ?? cadeteRaw.Telefono ?? null,
        } : null,
        pago: pagoRaw ? {
            id: pagoRaw.id ?? pagoRaw.Id ?? null,
            montoRecibido: Number(
                pagoRaw.montoRecibido
                ?? pagoRaw.MontoRecibido
                ?? pagoRaw.monto
                ?? pagoRaw.Monto
                ?? 0
            ),
            vuelto: pagoRaw.vuelto ?? pagoRaw.Vuelto ?? null,
            fechaCreacion: pagoRaw.fechaCreacion ?? pagoRaw.FechaCreacion ?? null,
            metodoPago: tipoPagoRaw ? {
                id: tipoPagoRaw.id ?? tipoPagoRaw.Id ?? null,
                nombre: tipoPagoRaw.nombre ?? tipoPagoRaw.Nombre ?? 'Método no identificado',
                esEfectivo: Boolean(tipoPagoRaw.esEfectivo ?? tipoPagoRaw.EsEfectivo ?? false),
            } : null,
        } : null,
        productos: productos.map((producto) => ({
            id: producto.id ?? producto.Id,
            idProducto: producto.idProducto ?? producto.IdProducto,
            nombre: producto.nombre ?? producto.Nombre ?? '-',
            precio: Number(producto.precio ?? producto.Precio ?? 0),
            indicaciones: producto.indicaciones ?? producto.Indicaciones ?? '',
            estadoPedido: producto.estadoPedido ?? producto.EstadoPedido ?? '',
            estadoPagado: producto.estadoPagado ?? producto.EstadoPagado ?? false,
            idMovimientoCaja: producto.idMovimientoCaja ?? producto.IdMovimientoCaja ?? null,
            fechaAgregado: producto.fechaAgregado ?? producto.FechaAgregado ?? null,
        })),
    };
}

export function normalizarDeliveryTakeawayComoVisita(item) {
    const pedido = normalizarDeliveryTakeaway(item);

    return {
        id: pedido.idVisita,
        idVisita: pedido.idVisita,
        idDeliveryTakeaway: pedido.id,
        fechaHora: pedido.fechaHora,
        estado: 'Cerrada',
        origen: esTakeaway(pedido) ? 'Takeaway' : 'Delivery',
        idMesa: null,
        numeroMesa: null,
        deliveryTakeaway: pedido,
        productosConsumidos: pedido.productos.map((producto) => ({
            id: producto.id,
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            indicaciones: producto.indicaciones,
            precio: producto.precio,
            precioDelMomento: producto.precio,
            estadoPagado: producto.estadoPagado,
            estadoPedido: producto.estadoPedido || 'Pendiente',
            estadoPreparacion: producto.estadoPedido === 'Listo'
                ? 2
                : producto.estadoPedido === 'En Preparación'
                    ? 1
                    : 0,
            idMovimientoCaja: producto.idMovimientoCaja ?? null,
            fechaAgregado: producto.fechaAgregado ?? null,
        })),
    };
}

export function esTakeaway(item) {
    return normalizarDeliveryTakeaway(item).idTipoEnvio === null;
}

export function esDelivery(item) {
    return !esTakeaway(item);
}

export function normalizarTakeawayDesdeVisita(visita) {
    const productosRaw = visita.productosConsumidos ?? visita.ProductosConsumidos ?? [];
    const productos = Array.isArray(productosRaw) ? productosRaw : [];

    return {
        id: visita.id ?? visita.Id,
        idVisita: visita.id ?? visita.Id,
        fechaHora: visita.fechaHora ?? visita.FechaHora ?? '',
        cliente: '-',
        direccion: null,
        telefono: null,
        indicaciones: null,
        precioTotal: Number(visita.total ?? visita.Total ?? 0),
        entregado: false,
        idTipoEnvio: null,
        tipoEnvio: null,
        productos: productos.map((producto) => ({
            id: producto.id ?? producto.Id,
            idProducto: producto.idProducto ?? producto.IdProducto,
            nombre: producto.nombre ?? producto.Nombre ?? '-',
            precio: Number(producto.precio ?? producto.Precio ?? 0),
            indicaciones: producto.indicaciones ?? producto.Indicaciones ?? '',
            estadoPedido: producto.estadoPedido ?? producto.EstadoPedido ?? '',
            estadoPagado: producto.estadoPagado ?? producto.EstadoPagado ?? false,
            idMovimientoCaja: producto.idMovimientoCaja ?? producto.IdMovimientoCaja ?? null,
            fechaAgregado: producto.fechaAgregado ?? producto.FechaAgregado ?? null,
        })),
    };
}

export async function GetTakeawaysDesdeVisitas() {
    const visitas = await ObtenerTodasLasVisitas();
    return (Array.isArray(visitas) ? visitas : [])
        .filter((visita) => {
            const origen = visita.origen ?? visita.Origen ?? '';
            return origen.toLowerCase() === 'takeaway';
        })
        .map(normalizarTakeawayDesdeVisita);
}

/**
 * GET /DeliveryTakeaway - Lista de deliveries/takeaway de la sucursal (según token).
 * @returns {Promise<Array>} Lista de DeliveryAndTakeaway
 */
export async function GetDeliveryTakeaway() {
    try {
        const response = await api.get('DeliveryTakeaway');
        return response.data ?? [];
    } catch (error) {
        console.error('Error al obtener deliveries/takeaway:', construirError(error, 'Error al obtener deliveries/takeaway'));
        throw construirError(error, 'Error al obtener deliveries/takeaway');
    }
}

/**
 * Convierte los valores del formulario al DTO que espera el backend.
 * @param {Object} values - { Cliente, Direccion, Telefono, Indicaciones, TipoEnvio (id), Productos (id o array de ids) }
 * @param {string} origen - "Delivery" | "Takeaway"
 */
function mapFormToCrearDTO(values, origen = 'Delivery') {
    const productos = values.Productos;
    const listaIds = Array.isArray(productos) ? productos : (productos ? [productos] : []);
    const ListaIDProductos = listaIds.map((idProducto) => ({
        IdProducto: idProducto,
        Detalles: '',
        Cantidad: 1,
    }));

    const esPedidoTakeaway = origen === 'Takeaway';
    const telefonoNormalizado = values.Telefono?.trim() || '';

    return {
        Origen: origen,
        NombreCliente: values.Cliente ?? '',
        Direccion: esPedidoTakeaway ? '' : (values.Direccion?.trim() || ''),
        Telefono: telefonoNormalizado,
        Indicaciones: values.Indicaciones ?? null,
        IdTipoEnvio: esPedidoTakeaway
            ? null
            : (values.TipoEnvio != null && values.TipoEnvio !== '' ? parseInt(values.TipoEnvio, 10) : null),
        IdPersonaRegistro: null,
        IdCadete: esPedidoTakeaway ? null : (values.Cadete != null && values.Cadete !== '' ? values.Cadete : null),
        ListaIDProductos,
    };
}

function mapComandaToCrearDTO(formValues, comanda, origen = 'Delivery') {
    const body = mapFormToCrearDTO(formValues, origen);

    return {
        ...body,
        ListaIDProductos: comanda.map((item) => ({
            IdProducto: item.producto.id,
            Detalles: item.indicaciones || '',
            Cantidad: item.cantidad,
        })),
    };
}

/**
 * POST /DeliveryTakeaway - Crea un nuevo delivery (o takeaway).
 * @param {Object} values - Valores del formulario (Cliente, Direccion, Telefono, Indicaciones, TipoEnvio, Productos)
 * @param {string} [origen='Delivery'] - "Delivery" o "Takeaway"
 * @returns {Promise<Object|null>} DeliveryAndTakeaway creado o null si hay error
 */
export async function CrearDeliveryTakeaway(values, origen = 'Delivery') {
    try {
        const body = mapFormToCrearDTO(values, origen);
        const response = await api.post(
            'DeliveryTakeaway/Crear',
            body
        );
        await sendHubMessage('RecargarDeliveryTakeaway');
        return response.data ?? null;
    } catch (error) {
        console.error('Error al crear delivery/takeaway:', construirError(error, 'Error al crear delivery/takeaway'));
        throw construirError(error, 'Error al crear delivery/takeaway');
    }
}

/**
 * Crea un delivery/takeaway desde formulario + comanda (lista de { producto, cantidad, indicaciones }).
 * @param {Object} formValues - { Cliente, Direccion, Telefono, Indicaciones, TipoEnvio }
 * @param {Array} comanda - [{ producto: { id, ... }, cantidad, indicaciones }, ...]
 * @param {string} [origen='Delivery'] - "Delivery" o "Takeaway"
 */
export async function CrearDeliveryTakeawayFromComanda(formValues, comanda, origen = 'Delivery') {
    try {
        const body = mapComandaToCrearDTO(formValues, comanda, origen);
        const response = await api.post(
            'DeliveryTakeaway/Crear',
            body
        );
        await sendHubMessage('RecargarDeliveryTakeaway');
        return response.data ?? null;
    } catch (error) {
        console.error('Error al crear delivery/takeaway:', construirError(error, 'Error al crear delivery/takeaway'));
        throw construirError(error, 'Error al crear delivery/takeaway');
    }
}

export async function ModificarDeliveryTakeaway(values) {
    try {
        const idDeliveryTakeaway = values.id ?? values.IdDeliveryTakeaway;
        const idVisita = values.idVisita ?? values.IdVisita;
        const origen = values.origen ?? values.Origen ?? 'Delivery';
        const esPedidoTakeaway = origen === 'Takeaway';
        if (!idDeliveryTakeaway) {
            throw new Error('El pedido a modificar no está disponible');
        }

        if (!idVisita) {
            throw new Error('La visita asociada al pedido no está disponible');
        }

        const payload = {
            IdDeliveryTakeaway: idDeliveryTakeaway,
            NombreCliente: values.Cliente ?? values.nombreCliente,
            Telefono: values.Telefono ?? values.telefono,
            Direccion: values.Direccion ?? values.direccion,
            Indicaciones: values.Indicaciones ?? values.indicaciones,
        };

        if (!esPedidoTakeaway) {
            const idTipoEnvio = values.TipoEnvio ?? values.idTipoEnvio ?? values.IdTipoEnvio;
            const idCadete = values.Cadete ?? values.idCadete ?? values.IdCadete ?? values.cadete?.id;

            if (idTipoEnvio != null && idTipoEnvio !== '') {
                payload.IdTipoEnvio = parseInt(idTipoEnvio, 10);
            }

            if (idCadete != null && idCadete !== '') {
                payload.IdCadete = idCadete;
            }
        }

        await api.patch('DeliveryTakeaway/ModificarDatos', payload);

        const productosOriginales = Array.isArray(values.productosOriginales) ? values.productosOriginales : [];
        const comandaActual = Array.isArray(values.comanda) ? values.comanda : [];

        const originalesPorClave = new Map();
        productosOriginales.forEach((producto) => {
            const key = `${producto.idProducto ?? producto.id}-${producto.indicaciones ?? ''}`;
            const lista = originalesPorClave.get(key) ?? [];
            lista.push(producto.id);
            originalesPorClave.set(key, lista);
        });

        const deseadosPorClave = new Map();
        comandaActual.forEach((item) => {
            const key = `${item.producto.id}-${item.indicaciones || ''}`;
            deseadosPorClave.set(key, {
                idProducto: item.producto.id,
                detalles: item.indicaciones || '',
                cantidad: item.cantidad,
            });
        });

        const idsARemover = [];
        const productosAAgregar = [];
        const claves = new Set([...originalesPorClave.keys(), ...deseadosPorClave.keys()]);

        claves.forEach((key) => {
            const idsOriginales = originalesPorClave.get(key) ?? [];
            const deseado = deseadosPorClave.get(key);
            const cantidadDeseada = deseado?.cantidad ?? 0;

            if (cantidadDeseada < idsOriginales.length) {
                idsARemover.push(...idsOriginales.slice(0, idsOriginales.length - cantidadDeseada));
            }

            if (cantidadDeseada > idsOriginales.length && deseado) {
                productosAAgregar.push({
                    IdProducto: deseado.idProducto,
                    Detalles: deseado.detalles,
                    Cantidad: cantidadDeseada - idsOriginales.length,
                });
            }
        });

        if (idsARemover.length > 0) {
            await EliminarProductosVisita(idVisita, idsARemover);
        }

        if (productosAAgregar.length > 0) {
            await AgregarProductosAVisita(idVisita, productosAAgregar);
        }

        await sendHubMessage('RecargarDeliveryTakeaway');

        return {
            id: idDeliveryTakeaway,
            idVisita,
        };
    } catch (error) {
        console.error('Error al modificar delivery/takeaway:', construirError(error, 'Error al modificar delivery/takeaway'));
        throw construirError(error, 'Error al modificar delivery/takeaway');
    }
}

export async function CambiarEstadoEntregaDeliveryTakeaway(id, entregado) {
    try {
        const response = await api.patch('DeliveryTakeaway/ModificarDatos', {
            IdDeliveryTakeaway: id,
            Entregado: entregado,
        });
        await sendHubMessage('RecargarDeliveryTakeaway');
        return response.data ?? null;
    } catch (error) {
        console.error('Error al cambiar estado de entrega:', construirError(error, 'Error al cambiar estado de entrega'));
        throw construirError(error, 'Error al cambiar estado de entrega');
    }
}

export async function EliminarDeliveryTakeaway(id) {
    try {
        const response = await api.delete('DeliveryTakeaway', {
            params: { id },
        });
        await sendHubMessage('RecargarDeliveryTakeaway');
        return response.data ?? null;
    } catch (error) {
        console.error('Error al eliminar delivery/takeaway:', construirError(error, 'Error al eliminar delivery/takeaway'));
        throw construirError(error, 'Error al eliminar delivery/takeaway');
    }
}
