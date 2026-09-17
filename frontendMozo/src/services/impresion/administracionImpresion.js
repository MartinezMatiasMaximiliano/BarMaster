import { apiAdministrativa, apiEstacion } from './clienteImpresion';
import { requerirIdEstacionRegistrada } from './almacenamientoEstacion';
import { asegurarSesionEstacion } from './sesionEstacion';
export async function sincronizarInventarioImpresoras(impresoras, versionQz, id = requerirIdEstacionRegistrada(), busquedaManual = false) { await asegurarSesionEstacion(); return (await apiEstacion.put(`impresion/estaciones/${id}/impresoras/sincronizar`, { versionAgente: 'web-1.0.0', versionQz, busquedaManual, impresoras: impresoras.map(nombreSistema => ({ nombreSistema, estado: null })) })).data; }
export async function obtenerImpresorasLocales(id = requerirIdEstacionRegistrada()) { await asegurarSesionEstacion(); return (await apiEstacion.get(`impresion/estaciones/${id}/impresoras`)).data; }
export async function obtenerImpresoras() { return (await apiAdministrativa.get('impresion/impresoras')).data; }
export async function actualizarImpresora(id, cambios) { return (await apiAdministrativa.patch(`impresion/impresoras/${id}`, cambios)).data; }
export async function eliminarImpresora(id) { await apiAdministrativa.delete(`impresion/impresoras/${id}`); }
export async function solicitarPruebaRemotaImpresora(id) { return (await apiAdministrativa.post(`impresion/impresoras/${id}/trabajos-prueba`)).data; }
