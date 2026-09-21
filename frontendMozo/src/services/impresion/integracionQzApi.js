import { apiAdministrativa, apiEstacion, apiSucursal } from './clienteImpresion';
import { obtenerTokenAccesoEstacion, requerirIdEstacionRegistrada } from './almacenamientoEstacion';
export async function obtenerCertificadoQz() { return (await apiSucursal.get('qz/certificado', { responseType: 'text', headers: { 'Cache-Control': 'no-cache' } })).data; }
export async function firmarResumenQz(solicitud) { const idEstacion = requerirIdEstacionRegistrada(); const cliente = obtenerTokenAccesoEstacion() ? apiEstacion : apiSucursal; return (await cliente.post('qz/firmar', { solicitud, idEstacion }, { responseType: 'text', headers: { 'X-Estacion-Impresion-ID': idEstacion } })).data; }
export async function obtenerEstadoQz() { return (await apiSucursal.get('qz/estado')).data; }
export async function obtenerDetalleEstadoQz() { return (await apiAdministrativa.get('qz/estado/detalle')).data; }
