const CLAVE_ID_INSTALACION = 'barmaster.impresion.idInstalacionCliente';

function claveConAmbito(sufijo) {
    const idInquilino = localStorage.getItem('tenantId') || 'inquilino-desconocido';
    const idSucursal = localStorage.getItem('idSucursal') || 'sucursal-desconocida';
    return `barmaster.impresion.${idInquilino}.${idSucursal}.${sufijo}`;
}

export function obtenerIdInstalacionCliente() {
    let idInstalacion = localStorage.getItem(CLAVE_ID_INSTALACION);
    if (!idInstalacion) {
        idInstalacion = crypto.randomUUID();
        localStorage.setItem(CLAVE_ID_INSTALACION, idInstalacion);
    }
    return idInstalacion;
}

function obtenerClaveEstacionRegistrada() {
    return claveConAmbito('idEstacion');
}

export function obtenerCredencialEstacion() { return localStorage.getItem(claveConAmbito('credencial')); }
export function guardarCredencialEstacion(valor) { localStorage.setItem(claveConAmbito('credencial'), valor); }
export function obtenerTokenAccesoEstacion() {
    const crudo = sessionStorage.getItem(claveConAmbito('sesion'));
    if (!crudo) return null;
    try {
        const sesion = JSON.parse(crudo);
        return new Date(sesion.venceEnUtc).getTime() > Date.now() + 30000 ? sesion.tokenAcceso : null;
    } catch { return null; }
}
export function guardarSesionEstacion(sesion) {
    sessionStorage.setItem(claveConAmbito('sesion'), JSON.stringify(sesion));
    return sesion;
}
export function limpiarSesionEstacion() { sessionStorage.removeItem(claveConAmbito('sesion')); }

export function obtenerIdEstacionRegistrada() {
    return localStorage.getItem(obtenerClaveEstacionRegistrada());
}

export function requerirIdEstacionRegistrada() {
    const idEstacion = obtenerIdEstacionRegistrada();
    if (!idEstacion) throw new Error('La estación todavía no fue registrada para esta sucursal.');
    return idEstacion;
}

export function guardarEstacionRegistrada(estacion) {
    if (!estacion?.id) throw new Error('El backend devolvió una estación sin identificador.');
    localStorage.setItem(obtenerClaveEstacionRegistrada(), estacion.id);
    return estacion;
}

export function esClaveAlmacenamientoImpresion(clave) {
    return clave === CLAVE_ID_INSTALACION || clave.startsWith('barmaster.impresion.');
}

export { CLAVE_ID_INSTALACION };
