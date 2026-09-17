import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.BARMASTER_API_URL;
let token = process.env.BARMASTER_TOKEN;
const tenant = process.env.BARMASTER_TENANT || process.env.BARMASTER_USERNAME?.split('@')[0];
const ejecutar = process.argv.includes('--ejecutar');
if (!base || !tenant || (!token && !(process.env.BARMASTER_USERNAME && process.env.BARMASTER_PASSWORD))) {
    throw new Error('Configurar BARMASTER_API_URL y credenciales de sucursal (USERNAME/PASSWORD o TOKEN/TENANT).');
}
async function api(ruta, method = 'GET', body) {
    const response = await fetch(new URL(ruta, base.endsWith('/') ? base : `${base}/`), {
        method,
        headers: { 'X-Tenant-ID': tenant, ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`${method} ${ruta}: HTTP ${response.status}`);
    return response.json();
}
if (!token) {
    token = (await api('Login', 'POST', { Username: process.env.BARMASTER_USERNAME,
        Password: process.env.BARMASTER_PASSWORD })).access_token;
    if (!token) throw new Error('Login sin access_token.');
}
const reservas = await api('Reservas');
const mesas = await api('Mesa');
if (!Array.isArray(reservas) || !Array.isArray(mesas)) throw new Error('Respuesta de listado inválida.');
if (reservas.some(r => !Object.hasOwn(r, 'idMesa'))) throw new Error('La API todavía no expone IdMesa. Aplicar migración y reiniciar antes de continuar.');
const disponibles = mesas.filter(m => m.plano).sort((a, b) => a.id.localeCompare(b.id));
if (!disponibles.length) throw new Error('No hay mesas vinculadas a un plano.');
const ordenadas = [...reservas].sort((a, b) => a.fechaHora.localeCompare(b.fechaHora) || a.id.localeCompare(b.id));
const uso = new Map();
const plan = ordenadas.map((r, i) => {
    // Conservar asignaciones existentes; dejar aproximadamente un 10% de las restantes sin mesa.
    let idMesa = r.idMesa;
    if (!idMesa && i % 10 !== 0) {
        const candidatas = disponibles.filter(m => m.capacidad >= (r.cantidadDePersonas || 1)
            && !uso.has(`${r.fechaHora}|${m.id}`));
        idMesa = candidatas.length ? candidatas[i % candidatas.length].id : null;
    }
    if (idMesa && r.estado.id !== 3) uso.set(`${r.fechaHora}|${idMesa}`, true);
    return { id: r.id, anterior: r.idMesa, idMesa };
});
console.log(JSON.stringify({ total: plan.length, conMesa: plan.filter(p => p.idMesa).length,
    sinMesa: plan.filter(p => !p.idMesa).length, cambios: plan.filter(p => p.idMesa !== p.anterior).length,
    ejecutar }));
if (ejecutar) {
    const carpeta = 'tools/datos-demo';
    mkdirSync(carpeta, { recursive: true });
    const respaldo = `${carpeta}/asignaciones-reservas-${Date.now()}.json`;
    writeFileSync(respaldo, JSON.stringify({ api: new URL(base).origin, tenant, plan }, null, 2), { flag: 'wx' });
    const porId = new Map(reservas.map(r => [r.id, r]));
    let modificadas = 0;
    for (const asignacion of plan.filter(p => p.idMesa !== p.anterior)) {
        const r = porId.get(asignacion.id);
        await api('Reservas', 'PUT', { Id: r.id, IdEstadoReserva: r.estado.id, IdMesa: asignacion.idMesa });
        modificadas++;
        if (modificadas % 50 === 0) console.log(`${modificadas} reservas actualizadas`);
    }
    const resultado = await api('Reservas');
    const finales = new Map(resultado.map(r => [r.id, r]));
    const campos = ['fechaHora', 'nombreReserva', 'telefonoContacto', 'cantidadDePersonas'];
    for (const p of plan) {
        const actual = finales.get(p.id);
        const original = porId.get(p.id);
        if (!actual || actual.idMesa !== p.idMesa || actual.estado.id !== original.estado.id
            || campos.some(c => actual[c] !== original[c])) throw new Error(`Verificación fallida para ${p.id}; consultar ${respaldo}.`);
    }
    console.log(JSON.stringify({ verificadas: plan.length, modificadas, respaldo }));
}
