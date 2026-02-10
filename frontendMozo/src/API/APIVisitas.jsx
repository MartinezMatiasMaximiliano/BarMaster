import axios from 'axios';
import datosPrueba from '../pages/Reportes/utils/datosPruebaReportes.json';
import { authService } from '../services/authService';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/** GET /TodasLasVisitas - Obtiene todas las visitas (activas y cerradas) para reportes y gráficas */
export async function ObtenerTodasLasVisitas() {
    try {
        const response = await axios.get(`${BASE_URL}TodasLasVisitas`, authService.getAuthHeaders());
        return response.data ?? [];
    } catch (error) {
        console.error('Error al obtener todas las visitas:', error);
        return [];
    }
}

export async function ObtenerVisitaPorId(idVisita) {
    try {
        const response = await axios.get(`${BASE_URL}Visita?IdVisita=${idVisita}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener caja activa:', error);
    }
}

/** GET /VisitasActivas - Obtiene todas las visitas con estado "Abierta" */
export async function BuscarVisitasActivas() {
    try {
        const response = await axios.get(`${BASE_URL}VisitasActivas`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener visitas activas:', error);
        return [];
    }
}

export async function AgregarProductosAVisita(idVisita, productos) {
    try {
        console.log("PRODUCTOS: ", productos);
        const response = await axios.post(
            `${BASE_URL}AgregarProductoAVisita?IdVisita=${idVisita}`,
            productos,
            authService.getAuthHeaders()
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
        const response = await axios.delete(
            `${BASE_URL}Visitas/EliminarProductos`,
            {
                ...authService.getAuthHeaders(),
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

/** POST /Visitas/Pagar - Marca productos de una visita como pagados */
export async function PagarProductosVisita(idVisita, idsProductos) {
    try {
        const response = await axios.post(
            `${BASE_URL}Visitas/Pagar`,
            {
                IdVisita: idVisita,
                IdsProductos: idsProductos
            },
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error al pagar productos de la visita:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

////////////////////////////// FUNCIONES PARA DATOS DE PRUEBA //////////////////////////////

// Función para simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función auxiliar para unir datos relacionados
const unirDatosRelacionados = (visitas, datosCompletos) => {
    return visitas.map(visita => {
        const productos = datosCompletos.productosPorVisita.filter(
            p => p.idVisita === visita.id
        );
        const pagos = datosCompletos.pagos.filter(
            p => p.idVisita === visita.id
        );
        const mesa = datosCompletos.mesas.find(m => m.id === visita.idMesa);
        const caja = datosCompletos.cajas.find(c => c.id === visita.idCaja);
        
        // Obtener el mozo a través de la mesa
        let mozo = null;
        if (mesa && mesa.idMozo) {
            mozo = datosCompletos.mozos?.find(m => m.id === mesa.idMozo);
        }

        return {
            ...visita,
            productos,
            pagos,
            mesa: mesa ? { ...mesa, mozo } : null,
            caja
        };
    });
};

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
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}Visitas/rango`, {
        //     params: { fechaInicio, fechaFin }
        // });
        // return response.data;

        // DATOS DE PRUEBA
        await delay(300);
        
        const visitas = datosPrueba.visitas.filter(v => {
            const fecha = new Date(v.fechaHora);
            return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
        });

        return unirDatosRelacionados(visitas, datosPrueba);
    } catch (error) {
        console.error('Error al obtener visitas por rango:', error);
        return [];
    }
}

export async function BuscarVisitasPorMozo(idMozo, filtros = {}) {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}Visitas/mozo/${idMozo}`, { params: filtros });
        // return response.data;

        // DATOS DE PRUEBA
        await delay(300);
        
        // Obtener mesas del mozo
        const mesasMozo = datosPrueba.mesas.filter(m => m.idMozo === idMozo);
        const idsMesas = mesasMozo.map(m => m.id);
        
        // Obtener visitas de esas mesas
        let visitas = datosPrueba.visitas.filter(v => idsMesas.includes(v.idMesa));
        
        // Aplicar filtros adicionales
        if (filtros.fechaInicio) {
            visitas = visitas.filter(v => new Date(v.fechaHora) >= new Date(filtros.fechaInicio));
        }
        if (filtros.fechaFin) {
            visitas = visitas.filter(v => new Date(v.fechaHora) <= new Date(filtros.fechaFin));
        }

        return unirDatosRelacionados(visitas, datosPrueba);
    } catch (error) {
        console.error('Error al obtener visitas por mozo:', error);
        return [];
    }
}

export async function BuscarVisitasPorMesa(idMesa, filtros = {}) {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}Visitas/mesa/${idMesa}`, { params: filtros });
        // return response.data;

        // DATOS DE PRUEBA
        await delay(300);
        
        let visitas = datosPrueba.visitas.filter(v => v.idMesa === idMesa);
        
        // Aplicar filtros adicionales
        if (filtros.fechaInicio) {
            visitas = visitas.filter(v => new Date(v.fechaHora) >= new Date(filtros.fechaInicio));
        }
        if (filtros.fechaFin) {
            visitas = visitas.filter(v => new Date(v.fechaHora) <= new Date(filtros.fechaFin));
        }

        return unirDatosRelacionados(visitas, datosPrueba);
    } catch (error) {
        console.error('Error al obtener visitas por mesa:', error);
        return [];
    }
}

export async function BuscarProductosPorVisita(idVisita) {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}ProductosPorVisita/visita/${idVisita}`);
        // return response.data;

        // DATOS DE PRUEBA
        await delay(200);
        return datosPrueba.productosPorVisita.filter(p => p.idVisita === idVisita);
    } catch (error) {
        console.error('Error al obtener productos por visita:', error);
        return [];
    }
}

export async function BuscarPagosPorVisita(idVisita) {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}Pagos/visita/${idVisita}`);
        // return response.data;

        // DATOS DE PRUEBA
        await delay(200);
        return datosPrueba.pagos.filter(p => p.idVisita === idVisita);
    } catch (error) {
        console.error('Error al obtener pagos por visita:', error);
        return [];
    }
}

export async function BuscarTodasLasMesas() {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}Mesas`);
        // return response.data;

        // DATOS DE PRUEBA
        await delay(200);
        return datosPrueba.mesas;
    } catch (error) {
        console.error('Error al obtener mesas:', error);
        return [];
    }
}

export async function BuscarTodosLosProductos() {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}Productos`);
        // return response.data;

        // DATOS DE PRUEBA
        await delay(200);
        return datosPrueba.productos;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

export async function BuscarTodasLasCategorias() {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}Categorias`);
        // return response.data;

        // DATOS DE PRUEBA
        await delay(200);
        return datosPrueba.categorias;
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return [];
    }
}

export async function BuscarTodosLosTipoPagos() {
    try {
        // TODO: Descomentar cuando esté lista la API real
        // const response = await axios.get(`${BASE_URL}TipoPagos`);
        // return response.data;

        // DATOS DE PRUEBA
        await delay(200);
        return datosPrueba.tipoPagos;
    } catch (error) {
        console.error('Error al obtener tipos de pago:', error);
        return [];
    }
}

export async function BuscarVisitaPorId(idVisita) {
    try {
        // TODO: Descomentar cuando esté lista la API real
        const response = await axios.get(`${BASE_URL}Visitas/${idVisita}`);
        return response.data;

        // DATOS DE PRUEBA
        // await delay(200);
        // const visita = datosPrueba.visitas.find(v => v.id === idVisita);
        // if (!visita) return null;
        // return unirDatosRelacionados([visita], datosPrueba)[0];
    } catch (error) {
        console.error('Error al obtener visita por ID:', error);
        return null;
    }
}