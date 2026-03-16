import api from '../services/axiosInstance';

/**
 * GET /DeliveryTakeaway - Lista de deliveries/takeaway de la sucursal (según token).
 * @returns {Promise<Array>} Lista de DeliveryAndTakeaway
 */
export async function GetDeliveryTakeaway() {
    try {
        const response = await api.get('DeliveryTakeaway');
        return response.data ?? [];
    } catch (error) {
        console.error('Error al obtener deliveries/takeaway:', error);
        return [];
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

    return {
        Origen: origen,
        NombreCliente: values.Cliente ?? '',
        Direccion: values.Direccion ?? null,
        Telefono: values.Telefono ?? null,
        Indicaciones: values.Indicaciones ?? null,
        IdTipoEnvio: values.TipoEnvio != null && values.TipoEnvio !== '' ? parseInt(values.TipoEnvio, 10) : null,
        IdPersonaRegistro: null,
        IdCadete: null,
        ListaIDProductos,
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
            'DeliveryTakeaway',
            body
        );
        return response.data ?? null;
    } catch (error) {
        console.error('Error al crear delivery/takeaway:', error);
        if (error.response?.data) throw error;
        throw error;
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
        const body = {
            Origen: origen,
            NombreCliente: formValues.Cliente ?? '',
            Direccion: formValues.Direccion ?? null,
            Telefono: formValues.Telefono ?? null,
            Indicaciones: formValues.Indicaciones ?? null,
            IdTipoEnvio: formValues.TipoEnvio != null && formValues.TipoEnvio !== '' ? parseInt(formValues.TipoEnvio, 10) : null,
            IdPersonaRegistro: null,
            IdCadete: null,
            ListaIDProductos: comanda.map((item) => ({
                IdProducto: item.producto.id,
                Detalles: item.indicaciones || '',
                Cantidad: item.cantidad,
            })),
        };
        const response = await api.post(
            'DeliveryTakeaway',
            body
        );
        return response.data ?? null;
    } catch (error) {
        console.error('Error al crear delivery/takeaway:', error);
        if (error.response?.data) throw error;
        throw error;
    }
}
