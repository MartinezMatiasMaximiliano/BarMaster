import axios from 'axios';
import { authService } from '../services/authService';

const BASE_URL_API = import.meta.env.VITE_BASE_URL;

const BASE_URL = import.meta.env.VITE_BASE_URL + "Menu";

export async function BuscarTodosLosMenus(idSucursal) {
    try {
        const response = await axios.get(`${BASE_URL_API}ListaMenu?IdSucursal=${idSucursal}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al buscar menús:", error);
        return [];
    }
}

export async function BuscarUnMenu(idMenu) {
    try {
        const response = await axios.get(`${BASE_URL}?id=${idMenu}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al buscar menú:", error);
        return null;
    }
}

export async function CrearMenu(datos) {
    try {
        const response = await axios.post(
            `${BASE_URL}/Menu`,
            {
                Nombre: datos.nombre,
                IdSucursal: datos.idSucursal
            },
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.error?.mensaje || "Error al crear el menú";
            alert(errorMessage);
        }
        return error.response;
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

        const response = await axios.patch(`${BASE_URL}`, body, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.error?.mensaje || "Error al modificar el menú";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function ActivarMenu(idMenu, activar) {
    try {
        const response = await axios.patch(
            `${BASE_URL_API}ActivarMenu?IdMenu=${idMenu}&Activar=${activar}`,
            {},
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.error?.mensaje || "Error al activar/desactivar el menú";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function DesactivarMenu(idMenu) {
    return await ActivarMenu(idMenu, false);
}

export async function BorrarMenu(idMenu) {
    try {
        const response = await axios.delete(
            `${BASE_URL}?IdMenu=${idMenu}`,
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.error?.mensaje || "Error al eliminar el menú";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function ModificarProductosMenu(idMenu, idsProductos) {
    try {
        const response = await axios.post(
            `${BASE_URL_API}Menu/ModificarProductos`,
            {
                IdMenu: idMenu,
                IdsProductos: idsProductos
            },
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error("Error al modificar productos del menú:", error);
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.error?.mensaje || "Error al modificar productos del menú";
            throw new Error(errorMessage);
        }
        throw error;
    }
}
