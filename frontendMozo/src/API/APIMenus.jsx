import api from '../services/axiosInstance';

export async function BuscarTodosLosMenus(idSucursal) {
    try {
        const response = await api.get(`ListaMenu?IdSucursal=${idSucursal}`);
        return response.data;
    } catch (error) {
        console.error("Error al buscar menús:", error);
        return [];
    }
}

export async function BuscarUnMenu(idMenu) {
    try {
        const response = await api.get(`Menu?id=${idMenu}`);
        return response.data;
    } catch (error) {
        console.error("Error al buscar menú:", error);
        return null;
    }
}

export async function CrearMenu(datos) {
    try {
        const response = await api.post(
            'Menu/Menu',
            {
                Nombre: datos.nombre,
                IdSucursal: datos.idSucursal
            }
        );
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al crear el menú";
        throw new Error(mensaje);
    }
}

export async function ModificarMenu(datos) {
    try {
        const body = {
            IdMenu: datos.id
        };
        if (datos.nombre !== undefined) {
            body.Nombre = datos.nombre;
        }
        if (datos.activo !== undefined) {
            body.Activo = datos.activo;
        }

        const response = await api.patch('Menu', body);
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al modificar el menú";
        throw new Error(mensaje);
    }
}

export async function ActivarMenu(idMenu, activar) {
    try {
        const response = await api.patch(
            `ActivarMenu?IdMenu=${idMenu}&Activar=${activar}`,
            {}
        );
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al activar/desactivar el menú";
        throw new Error(mensaje);
    }
}

export async function DesactivarMenu(idMenu) {
    return await ActivarMenu(idMenu, false);
}

export async function BorrarMenu(idMenu) {
    try {
        const response = await api.delete(
            `Menu?IdMenu=${idMenu}`
        );
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al eliminar el menú";
        throw new Error(mensaje);
    }
}

export async function ModificarProductosMenu(idMenu, idsProductos) {
    try {
        const response = await api.post(
            'Menu/ModificarProductos',
            {
                IdMenu: idMenu,
                IdsProductos: idsProductos
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al modificar productos del menú:", error);
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al modificar productos del menú";
        throw new Error(mensaje);
    }
}
