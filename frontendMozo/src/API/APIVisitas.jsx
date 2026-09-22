import api from '../services/axiosInstance';
import { generarUUID } from '../Helpers/generarUUID';
import { sendHubMessage } from '../connections/HubConnMozo';
import { construirError } from './APIError';

/** GET /TodasLasVisitas - Obtiene visitas activas y cerradas, opcionalmente dentro de un rango. */
export async function ObtenerTodasLasVisitas(desde, hasta) {
    try {
        const response = await api.get('TodasLasVisitas', {
            params: {
                ...(desde ? { desde } : {}),
                ...(hasta ? { hasta } : {}),
            },
        });
        return response.data ?? [];
    } catch (error) {
        console.error('Error al obtener todas las visitas:', construirError(error, 'Error al obtener todas las visitas'));
        return [];
    }
}

export function obtenerRangoDiasVisitas(fechaInicio, fechaFin) {
    return {
        desde: `${fechaInicio}T00:00:00-03:00`,
        hasta: `${fechaFin}T23:59:59.999-03:00`,
    };
}

export async function ObtenerVisitaPorId(idVisita) {
    try {
        const response = await api.get(`Visita?IdVisita=${idVisita}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener caja activa:', construirError(error, 'Error al obtener la visita'));
    }
}

/** GET /VisitasActivas - Obtiene todas las visitas con estado "Abierta" */
export async function BuscarVisitasActivas() {
    try {
        const response = await api.get('VisitasActivas');
        return response.data;
    } catch (error) {
        console.error('Error al obtener visitas activas:', construirError(error, 'Error al obtener visitas activas'));
        return [];
    }
}

export async function AgregarProductosAVisita(idVisita, productos, idComando = generarUUID()) {
    try {
        const response = await api.post(
            `AgregarProductoAVisita?IdVisita=${idVisita}&idComando=${idComando}`,
            productos
        );
        await sendHubMessage('StockActualizado');
        return response.data;
    } catch (error) {
        console.error('Error al agregar productos a la visita:', construirError(error, 'Error al agregar productos a la visita'));
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        if (error.request) {
            console.error('Request:', error.request);
        }
        throw construirError(error, 'Error al agregar productos a la visita');
    }
}

/** DELETE /Visitas/EliminarProductos - Elimina productos de una visita */
export async function EliminarProductosVisita(idVisita, idsProductos) {
    try {
        const response = await api.delete(
            'Visitas/EliminarProductos',
            {
                data: {
                    IdVisita: idVisita,
                    IdsProductos: idsProductos
                }
            }
        );
        await sendHubMessage('StockActualizado');
        return response.data;
    } catch (error) {
        console.error('Error al eliminar productos de la visita:', construirError(error, 'Error al eliminar productos de la visita'));
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw construirError(error, 'Error al eliminar productos de la visita');
    }
}

/** PATCH /Visitas/CambiarEstadoProducto - Cambia el estado de un producto */
export async function CambiarEstadoProducto(idProducto, estado) {
    try {
        const response = await api.patch(
            'Visitas/CambiarEstadoProducto',
            {
                IdProducto: idProducto,
                Estado: estado
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al cambiar estado del producto:', construirError(error, 'Error al cambiar el estado del producto'));
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw construirError(error, 'Error al cambiar el estado del producto');
    }
}

export async function BuscarTodasLasVisitas(filtros = {}) {
    try {
        const rango = filtros.fechaInicio && filtros.fechaFin
            ? obtenerRangoDiasVisitas(filtros.fechaInicio, filtros.fechaFin)
            : {};
        const visitas = await ObtenerTodasLasVisitas(rango.desde, rango.hasta);
        if (!Array.isArray(visitas)) return [];

        let resultado = [...visitas];

        if (filtros.fechaInicio) {
            resultado = resultado.filter(v => new Date(v.fechaHora) >= new Date(filtros.fechaInicio));
        }
        if (filtros.fechaFin) {
            const fechaFin = new Date(`${filtros.fechaFin}T23:59:59.999`);
            resultado = resultado.filter(v => new Date(v.fechaHora) <= fechaFin);
        }
        if (filtros.idMesa) {
            resultado = resultado.filter(v => v.idMesa === filtros.idMesa);
        }
        if (filtros.estado) {
            resultado = resultado.filter(v => v.estado === filtros.estado);
        }

        return resultado;
    } catch (error) {
        console.error('Error al obtener visitas:', construirError(error, 'Error al obtener visitas'));
        return [];
    }
}

export async function BuscarVisitasPorRango(fechaInicio, fechaFin) {
    try {
        const visitas = await ObtenerTodasLasVisitas(fechaInicio, fechaFin);
        if (!Array.isArray(visitas)) return [];
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return visitas.filter(v => {
            const fecha = new Date(v.fechaHora || v.FechaHora);
            return fecha >= inicio && fecha <= fin;
        });
    } catch (error) {
        console.error('Error al obtener visitas por rango:', construirError(error, 'Error al obtener visitas por rango'));
        return [];
    }
}

export async function BuscarVisitasPorMozo(idMozo, filtros = {}) {
    try {
        const rango = filtros.fechaInicio && filtros.fechaFin
            ? obtenerRangoDiasVisitas(filtros.fechaInicio, filtros.fechaFin)
            : {};
        const visitas = await ObtenerTodasLasVisitas(rango.desde, rango.hasta);
        if (!Array.isArray(visitas)) return [];
        let resultado = visitas.filter(v => v.idMozo === idMozo || v.IdMozo === idMozo);
        if (filtros.fechaInicio) {
            resultado = resultado.filter(v => new Date(v.fechaHora || v.FechaHora) >= new Date(filtros.fechaInicio));
        }
        if (filtros.fechaFin) {
            resultado = resultado.filter(v => new Date(v.fechaHora || v.FechaHora) <= new Date(filtros.fechaFin));
        }
        return resultado;
    } catch (error) {
        console.error('Error al obtener visitas por mozo:', construirError(error, 'Error al obtener visitas por mozo'));
        return [];
    }
}

export async function BuscarVisitasPorMesa(idMesa, filtros = {}) {
    try {
        const rango = filtros.fechaInicio && filtros.fechaFin
            ? obtenerRangoDiasVisitas(filtros.fechaInicio, filtros.fechaFin)
            : {};
        const visitas = await ObtenerTodasLasVisitas(rango.desde, rango.hasta);
        if (!Array.isArray(visitas)) return [];
        let resultado = visitas.filter(v => (v.idMesa ?? v.IdMesa) === idMesa);
        if (filtros.fechaInicio) {
            resultado = resultado.filter(v => new Date(v.fechaHora || v.FechaHora) >= new Date(filtros.fechaInicio));
        }
        if (filtros.fechaFin) {
            resultado = resultado.filter(v => new Date(v.fechaHora || v.FechaHora) <= new Date(filtros.fechaFin));
        }
        return resultado;
    } catch (error) {
        console.error('Error al obtener visitas por mesa:', construirError(error, 'Error al obtener visitas por mesa'));
        return [];
    }
}

export async function BuscarProductosPorVisita(idVisita) {
    try {
        const visita = await ObtenerVisitaPorId(idVisita);
        const productos = visita?.productosConsumidos ?? visita?.ProductosConsumidos ?? visita?.Productos ?? [];
        return Array.isArray(productos) ? productos : [];
    } catch (error) {
        console.error('Error al obtener productos por visita:', construirError(error, 'Error al obtener productos por visita'));
        return [];
    }
}

export async function BuscarPagosPorVisita(idVisita) {
    return [];
}

// Alias conservado para consumidores externos; comparte el contrato actual.
export const BuscarVisitaPorId = ObtenerVisitaPorId;
