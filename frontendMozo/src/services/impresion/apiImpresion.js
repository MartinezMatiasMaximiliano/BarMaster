import axios from 'axios';
import { generarUUID } from '../../Helpers/generarUUID';
import api from '../axiosInstance';
import {
    obtenerIdInstalacionCliente, obtenerTokenAccesoEstacion, obtenerCredencialEstacion,
    requerirIdEstacionRegistrada, guardarEstacionRegistrada, guardarCredencialEstacion, guardarSesionEstacion,
} from './almacenamientoEstacion';

const apiAdministrativa = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });
const apiEstacion = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });
let promesaRegistro = null;

apiAdministrativa.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('USER_token');
    const tenantId = localStorage.getItem('tenantId');
    if (token && !config.__printingBranchRetry) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
    return config;
});

apiEstacion.interceptors.request.use((config) => {
    const token = obtenerTokenAccesoEstacion();
    const tenantId = localStorage.getItem('tenantId');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
    return config;
});

apiAdministrativa.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config;
        const tokenSucursal = localStorage.getItem('token');
        const tokenUsuario = localStorage.getItem('USER_token');
        const autorizacionActual = request?.headers?.get?.('Authorization')
            || request?.headers?.Authorization;
        const tokenAlternativo = [tokenSucursal, tokenUsuario]
            .filter(Boolean)
            .find((token) => `Bearer ${token}` !== autorizacionActual);
        if (error.response?.status === 403 && request && !request.__printingBranchRetry
            && tokenAlternativo) {
            request.__printingBranchRetry = true;
            if (request.headers?.set) request.headers.set('Authorization', `Bearer ${tokenAlternativo}`);
            else request.headers.Authorization = `Bearer ${tokenAlternativo}`;
            return apiAdministrativa.request(request);
        }
        return Promise.reject(error);
    },
);

export async function obtenerCertificadoQz() {
    const response = await api.get('qz/certificado', {
        responseType: 'text',
        headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
}

export async function firmarResumenQz(solicitud) {
    const idEstacion = requerirIdEstacionRegistrada();
    const client = obtenerTokenAccesoEstacion() ? apiEstacion : api;
    const response = await client.post('qz/firmar', { solicitud, idEstacion }, {
        responseType: 'text',
        headers: { 'X-Estacion-Impresion-ID': idEstacion },
    });
    return response.data;
}

export async function obtenerEstadoQz() {
    const { data } = await api.get('qz/estado');
    return data;
}

export async function obtenerDetalleEstadoQz() {
    const client = localStorage.getItem('USER_token') ? apiAdministrativa : api;
    const { data } = await client.get('qz/estado/detalle');
    return data;
}

export async function registrarEstacionActual(nombre) {
    const idInstalacionCliente = obtenerIdInstalacionCliente();
    let nombreEstacion = nombre?.trim();
    if (!nombreEstacion) {
        try {
            nombreEstacion = (await obtenerEstacionActual(idInstalacionCliente)).nombre;
        } catch (error) {
            if (error.response?.status !== 404) throw error;
        }
    }
    const { data } = await api.post('impresion/estaciones/registrar', {
        idInstalacionCliente,
        nombre: nombreEstacion || `Caja ${idInstalacionCliente.slice(0, 8)}`,
    });
    return guardarEstacionRegistrada(data);
}

export async function darAltaEstacionActual(nombre) {
    const { data } = await apiAdministrativa.post('impresion/estaciones/alta', {
        idInstalacionCliente: obtenerIdInstalacionCliente(), nombre: nombre,
    });
    guardarEstacionRegistrada(data.estacion);
    let credencial = data.credencial;
    if (!credencial && obtenerCredencialEstacion()) {
        try { await crearSesionEstacion(); return data.estacion; } catch { /* La credencial local quedó obsoleta. */ }
    }
    if (!credencial) {
        const { data: rotada } = await apiAdministrativa.post(`impresion/estaciones/${data.estacion.id}/rotar-credencial`);
        credencial = rotada.credencial;
    }
    if (credencial) guardarCredencialEstacion(credencial);
    return data.estacion;
}

export async function crearSesionEstacion() {
    const credencial = obtenerCredencialEstacion();
    if (!credencial) throw new Error('CREDENCIAL_ESTACION_FALTANTE');
    const { data } = await apiAdministrativa.post('impresion/estaciones/sesion', {
        idSucursal: localStorage.getItem('idSucursal'),
        idInstalacionCliente: obtenerIdInstalacionCliente(), credencial: credencial,
    });
    return guardarSesionEstacion(data);
}

export async function asegurarSesionEstacion() {
    if (obtenerTokenAccesoEstacion()) return obtenerTokenAccesoEstacion();
    return (await crearSesionEstacion()).tokenAcceso;
}

export async function sincronizarInventarioImpresoras(impresoras, versionQz, idEstacion = requerirIdEstacionRegistrada(), busquedaManual = false) {
    await asegurarSesionEstacion();
    const { data } = await apiEstacion.put(`impresion/estaciones/${idEstacion}/impresoras/sincronizar`, {
        versionAgente: 'web-1.0.0', versionQz, busquedaManual, impresoras: impresoras.map((nombre) => ({ nombreSistema: nombre, estado: null })),
    });
    return data;
}

export async function obtenerImpresorasLocales(idEstacion = requerirIdEstacionRegistrada()) {
    await asegurarSesionEstacion();
    return (await apiEstacion.get(`impresion/estaciones/${idEstacion}/impresoras`)).data;
}

export async function obtenerImpresoras() { return (await apiAdministrativa.get('impresion/impresoras')).data; }
export async function actualizarImpresora(id, cambios) { return (await apiAdministrativa.patch(`impresion/impresoras/${id}`, cambios)).data; }
export async function eliminarImpresora(id) { await apiAdministrativa.delete(`impresion/impresoras/${id}`); }
export async function solicitarPruebaRemotaImpresora(id) { return (await apiAdministrativa.post(`impresion/impresoras/${id}/trabajos-prueba`)).data; }

export async function reservarTrabajosImpresion(maximoTrabajos = 3) {
    await asegurarSesionEstacion();
    return (await apiEstacion.post('impresion/estacion/trabajos/reservar', { maximoTrabajos })).data;
}
export async function marcarTrabajoEnviando(id, idReserva) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/enviando`, { idReserva }); }
export async function marcarTrabajoAceptado(id, idReserva) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/aceptado-por-cola`, { idReserva }); }
export async function fallarTrabajoImpresion(id, cuerpo) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/fallido`, cuerpo); }
export async function renovarReservaTrabajo(id, idReserva) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/renovar-reserva`, { idReserva }); }

export async function solicitarPreticket(idVisita, idsProductos = [], idComando = generarUUID()) {
    return (await api.post('impresion/solicitudes/preticket', { idComando, idVisita, idsProductos })).data;
}
export async function obtenerSolicitudImpresion(idSolicitud) { return (await api.get(`impresion/solicitudes/${idSolicitud}`)).data; }
export async function obtenerReglasImpresion() { return (await apiAdministrativa.get('impresion/reglas')).data; }
export async function guardarReglaImpresion(regla) { return (await apiAdministrativa.put('impresion/reglas', regla)).data; }
export async function eliminarReglaImpresion(id) { await apiAdministrativa.delete(`impresion/reglas/${id}`); }
export async function validarReglasImpresion() { return (await apiAdministrativa.post('impresion/reglas/validar')).data; }
export async function obtenerPanelImpresion() { return (await apiAdministrativa.get('impresion/panel')).data; }
export async function obtenerTrabajosImpresion(params = {}) { return (await apiAdministrativa.get('impresion/trabajos', { params })).data; }
export async function reintentarTrabajoImpresion(id, motivo) { return (await apiAdministrativa.post(`impresion/trabajos/${id}/reintentar`, { motivo })).data; }
export async function cancelarTrabajoImpresion(id, motivo) { await apiAdministrativa.post(`impresion/trabajos/${id}/cancelar`, { motivo }); }
export { apiEstacion };

export async function obtenerEstacionActual(idInstalacionCliente = obtenerIdInstalacionCliente()) {
    const { data } = await api.get('impresion/estaciones/actual', {
        params: { idInstalacionCliente },
    });
    return guardarEstacionRegistrada(data);
}

export function asegurarEstacionActualRegistrada(nombre) {
    if (!promesaRegistro) {
        promesaRegistro = registrarEstacionActual(nombre).finally(() => { promesaRegistro = null; });
    }
    return promesaRegistro;
}

export async function registrarLatidoEstacion(idEstacion = requerirIdEstacionRegistrada()) {
    const { data } = await api.post(`impresion/estaciones/${idEstacion}/latido`);
    return data;
}
