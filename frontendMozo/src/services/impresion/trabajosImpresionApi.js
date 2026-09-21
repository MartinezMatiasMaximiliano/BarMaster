import { generarUUID } from '../../Helpers/generarUUID';
import { apiAdministrativa, apiEstacion, apiSucursal } from './clienteImpresion';
import { asegurarSesionEstacion } from './sesionEstacion';
export async function reservarTrabajosImpresion(maximoTrabajos = 3) { await asegurarSesionEstacion(); return (await apiEstacion.post('impresion/estacion/trabajos/reservar', { maximoTrabajos })).data; }
export async function marcarTrabajoEnviando(id, idReserva) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/enviando`, { idReserva }); }
export async function marcarTrabajoAceptado(id, idReserva) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/aceptado-por-cola`, { idReserva }); }
export async function fallarTrabajoImpresion(id, cuerpo) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/fallido`, cuerpo); }
export async function renovarReservaTrabajo(id, idReserva) { await asegurarSesionEstacion(); await apiEstacion.post(`impresion/estacion/trabajos/${id}/renovar-reserva`, { idReserva }); }
export async function solicitarPreticket(idVisita, idsProductos = [], idComando = generarUUID()) { return (await apiSucursal.post('impresion/solicitudes/preticket', { idComando, idVisita, idsProductos })).data; }
export async function obtenerSolicitudImpresion(id) { return (await apiSucursal.get(`impresion/solicitudes/${id}`)).data; }
export async function obtenerPanelImpresion() { return (await apiAdministrativa.get('impresion/panel')).data; }
export async function obtenerTrabajosImpresion(params = {}) { return (await apiAdministrativa.get('impresion/trabajos', { params })).data; }
export async function reintentarTrabajoImpresion(id, motivo) { return (await apiAdministrativa.post(`impresion/trabajos/${id}/reintentar`, { motivo })).data; }
export async function cancelarTrabajoImpresion(id, motivo) { await apiAdministrativa.post(`impresion/trabajos/${id}/cancelar`, { motivo }); }
