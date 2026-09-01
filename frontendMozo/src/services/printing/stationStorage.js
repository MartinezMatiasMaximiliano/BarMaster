const INSTALLATION_ID_KEY = 'barmaster.printing.stationId';

export function getClientInstallationId() {
    let installationId = localStorage.getItem(INSTALLATION_ID_KEY);
    if (!installationId) {
        installationId = crypto.randomUUID();
        localStorage.setItem(INSTALLATION_ID_KEY, installationId);
    }
    return installationId;
}

function getRegisteredStationStorageKey() {
    const tenantId = localStorage.getItem('tenantId') || 'unknown-tenant';
    const sucursalId = localStorage.getItem('idSucursal') || 'unknown-sucursal';
    return `barmaster.printing.${tenantId}.${sucursalId}.stationId`;
}

export function getRegisteredStationId() {
    return localStorage.getItem(getRegisteredStationStorageKey());
}

export function requireRegisteredStationId() {
    const stationId = getRegisteredStationId();
    if (!stationId) throw new Error('La estación todavía no fue registrada para esta sucursal.');
    return stationId;
}

export function storeRegisteredStation(station) {
    if (!station?.id) throw new Error('El backend devolvió una estación sin identificador.');
    localStorage.setItem(getRegisteredStationStorageKey(), station.id);
    return station;
}

export function getAssignmentStorageKey() {
    const tenantId = localStorage.getItem('tenantId') || 'unknown-tenant';
    const sucursalId = localStorage.getItem('idSucursal') || 'unknown-sucursal';
    const stationId = getRegisteredStationId() || getClientInstallationId();
    return `barmaster.printing.${tenantId}.${sucursalId}.${stationId}.assignments`;
}

export function readCachedAssignments() {
    try {
        return JSON.parse(localStorage.getItem(getAssignmentStorageKey()) || '[]');
    } catch {
        return [];
    }
}

export function cacheAssignments(assignments) {
    localStorage.setItem(getAssignmentStorageKey(), JSON.stringify(assignments));
}

export function isPrintingStorageKey(key) {
    return key === INSTALLATION_ID_KEY || key.startsWith('barmaster.printing.');
}

export { INSTALLATION_ID_KEY };
