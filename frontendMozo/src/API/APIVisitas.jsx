import api from '../services/axiosInstance';

/** GET /TodasLasVisitas - Obtiene todas las visitas (activas y cerradas) para reportes y gráficas */
export async function ObtenerTodasLasVisitas() {
    try {
        const response = await api.get('TodasLasVisitas');
        return response.data ?? [];
    } catch (error) {
        console.error('Error al obtener todas las visitas:', error);
        return [];
    }
}

export async function ObtenerVisitaPorId(idVisita) {
    try {
        const response = await api.get(`Visita?IdVisita=${idVisita}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener caja activa:', error);
    }
}

/** GET /VisitasActivas - Obtiene todas las visitas con estado "Abierta" */
export async function BuscarVisitasActivas() {
    try {
        const response = await api.get('VisitasActivas');
        return response.data;
    } catch (error) {
        console.error('Error al obtener visitas activas:', error);
        return [];
    }
}

export async function AgregarProductosAVisita(idVisita, productos) {
    try {
        const response = await api.post(
            `AgregarProductoAVisita?IdVisita=${idVisita}`,
            productos
        );
        
        return response.data;
    } catch (error) {
        console.error('Error al agregar productos a la visita:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        if (error.request) {
            console.error('Request:', error.request);
        }
        throw error;
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
        return response.data;
    } catch (error) {
        console.error('Error al eliminar productos de la visita:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
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
        console.error('Error al cambiar estado del producto:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

export async function BuscarTodasLasVisitas(filtros = {}) {
    try {
        const visitas = await ObtenerTodasLasVisitas();
        if (!Array.isArray(visitas)) return [];

        let resultado = [...visitas];

        if (filtros.fechaInicio) {
            resultado = resultado.filter(v => new Date(v.fechaHora) >= new Date(filtros.fechaInicio));
        }
        if (filtros.fechaFin) {
            resultado = resultado.filter(v => new Date(v.fechaHora) <= new Date(filtros.fechaFin));
        }
        if (filtros.idMesa) {
            resultado = resultado.filter(v => v.idMesa === filtros.idMesa);
        }
        if (filtros.estado) {
            resultado = resultado.filter(v => v.estado === filtros.estado);
        }

        return resultado;
    } catch (error) {
        console.error('Error al obtener visitas:', error);
        return [];
    }
}

export async function BuscarVisitasPorRango(fechaInicio, fechaFin) {
    try {
        const visitas = await ObtenerTodasLasVisitas();
        if (!Array.isArray(visitas)) return [];
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return visitas.filter(v => {
            const fecha = new Date(v.fechaHora || v.FechaHora);
            return fecha >= inicio && fecha <= fin;
        });
    } catch (error) {
        console.error('Error al obtener visitas por rango:', error);
        return [];
    }
}

export async function BuscarVisitasPorMozo(idMozo, filtros = {}) {
    try {
        const visitas = await ObtenerTodasLasVisitas();
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
        console.error('Error al obtener visitas por mozo:', error);
        return [];
    }
}

export async function BuscarVisitasPorMesa(idMesa, filtros = {}) {
    try {
        const visitas = await ObtenerTodasLasVisitas();
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
        console.error('Error al obtener visitas por mesa:', error);
        return [];
    }
}

export async function BuscarProductosPorVisita(idVisita) {
    try {
        const visitas = await ObtenerTodasLasVisitas();
        if (!Array.isArray(visitas)) return [];
        const visita = visitas.find(v => (v.id ?? v.Id) === idVisita);
        const productos = visita?.productosConsumidos ?? visita?.ProductosConsumidos ?? visita?.Productos ?? [];
        return Array.isArray(productos) ? productos : [];
    } catch (error) {
        console.error('Error al obtener productos por visita:', error);
        return [];
    }
}

export async function BuscarPagosPorVisita(idVisita) {
    return [];
}

export async function BuscarVisitaPorId(idVisita) {
    try {
        const response = await api.get(`Visitas/${idVisita}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener visita por ID:', error);
        return null;
    }
}