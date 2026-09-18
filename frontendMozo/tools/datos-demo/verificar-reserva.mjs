const base = process.env.BARMASTER_API_URL || 'http://127.0.0.1:5198/';
const tenant = process.env.BARMASTER_USERNAME.split('@')[0];
let token;
async function api(ruta, method = 'GET', body) {
    const response = await fetch(new URL(ruta, base), { method,
        headers: { 'X-Tenant-ID': tenant, ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) throw new Error(`${ruta}: HTTP ${response.status}`);
    return response.json();
}
token = (await api('Login', 'POST', { Username: process.env.BARMASTER_USERNAME, Password: process.env.BARMASTER_PASSWORD })).access_token;
const reservas = await api('Reservas');
const reserva = reservas.find(r => r.nombreReserva.includes('· DEMO '));
if (!reserva || !Object.hasOwn(reserva, 'idMesa')) throw new Error('GET /Reservas no devolvió idMesa.');
const mesa = (await api('Mesa')).find(m => m.plano);
if (!mesa) throw new Error('No hay mesas asignadas a un plano para verificar.');
const body = { Id: reserva.id, IdEstadoReserva: reserva.estado.id, FechaHora: reserva.fechaHora,
    NombreReserva: reserva.nombreReserva, Telefono: reserva.telefonoContacto, CantidadDePersonas: reserva.cantidadDePersonas };
async function comprobar(mesa) {
    const actual = (await api('Reservas')).find(r => r.id === reserva.id);
    if (actual.idMesa !== mesa) throw new Error(`Mesa inesperada: ${actual.idMesa}`);
}
try {
    await api('Reservas', 'PUT', { ...body, IdMesa: mesa.id });
    await comprobar(mesa.id);
    await api('Reservas', 'PUT', body);
    await comprobar(mesa.id);
    await api('Reservas', 'PUT', { ...body, IdMesa: null });
    await comprobar(null);
    const fecha = new Date(new Date(reserva.fechaHora).getTime() - 3 * 3600000).toISOString().slice(0, 10);
    const porFecha = await api(`Reservas/Fechas?Desde=${fecha}`);
    if (!porFecha.some(r => r.id === reserva.id && Object.hasOwn(r, 'mesaReserva'))) throw new Error('El GET por fecha no devolvió el campo.');
    console.log('HTTP verificado: GET, GET por fecha, PUT para cambiar, conservar y quitar mesa.');
} finally {
    await api('Reservas', 'PUT', { ...body, IdMesa: reserva.idMesa });
    await comprobar(reserva.idMesa);
    console.log(`Reserva restaurada; se mantienen ${reservas.length} reservas.`);
}
