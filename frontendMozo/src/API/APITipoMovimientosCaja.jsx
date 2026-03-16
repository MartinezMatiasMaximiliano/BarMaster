import api from '../services/axiosInstance'

export async function BuscarTipoMovimientosPorEntorno(entorno) {
    try {
        const response = await api.get('TipoMovimientosCaja', {
            params: { Entorno: entorno }
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        return error.response;
    }
}

export async function CrearTipoMovimientoCaja(datos) {
    try {
        const payload = {
            nombre: datos.nombre || datos,
            esIngreso: datos.esIngreso ?? false,
            esEfectivo: datos.esEfectivo ?? false,
        };
        const response = await api.post('TipoMovimientosCaja', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.message
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al crear el tipo de movimiento";
        throw new Error(mensaje);
    }
}

export async function EliminarTipoMovimientoCaja(id) {
    try {
        const response = await api.delete(`TipoMovimientosCaja/${id}`);
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.message
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al eliminar el tipo de movimiento";
        throw new Error(mensaje);
    }
}
