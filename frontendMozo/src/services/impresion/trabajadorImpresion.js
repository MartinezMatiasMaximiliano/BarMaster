import * as signalR from '@microsoft/signalr';
import { impresionDistribuidaHabilitada, trabajadorImpresionHabilitado } from './funcionalidadesImpresion';
import { obtenerIdEstacionRegistrada, obtenerCredencialEstacion } from './almacenamientoEstacion';
import {
    reservarTrabajosImpresion, asegurarSesionEstacion, fallarTrabajoImpresion, marcarTrabajoAceptado, marcarTrabajoEnviando,
    renovarReservaTrabajo, sincronizarInventarioImpresoras,
} from './apiImpresion';
import { conectarQz, obtenerVersionQz } from './conexionQz';
import { buscarImpresoras, requerirImpresora } from './impresorasQz';
import { imprimirCrudo } from './impresionQz';
import { formatearTrabajoCrudo } from './formateadoresTrabajos';

const MILISEGUNDOS_CONSULTA = 15000;
const MILISEGUNDOS_LATIDO = 30000;
const NOMBRE_BLOQUEO = 'barmaster-printing-worker';
let detencionActiva = null;

const esperar = (ms, signal) => new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(id); resolve(); }, { once: true });
});

function urlHub() {
    return new URL('hubs/impresion', import.meta.env.VITE_BASE_URL).toString();
}

async function procesarTrabajo(trabajo) {
    let envioIniciado = false;
    let renovacion;
    try {
        const opciones = { copias: trabajo.copias, codificacion: trabajo.codificacion, omitirComprobacionImpresora: true, nombreTrabajo: `BarMaster ${trabajo.tipoDocumento} ${trabajo.id}` };
        const datos = formatearTrabajoCrudo(trabajo);
        await requerirImpresora(trabajo.nombreSistema);
        await marcarTrabajoEnviando(trabajo.id, trabajo.idReserva);
        envioIniciado = true;
        renovacion = setInterval(() => renovarReservaTrabajo(trabajo.id, trabajo.idReserva).catch(() => {}), 15000);
        await imprimirCrudo(trabajo.nombreSistema, datos, opciones);
        await marcarTrabajoAceptado(trabajo.id, trabajo.idReserva);
    } catch (error) {
        const codigoError = error?.message || 'IMPRESION_FALLIDA';
        const errorNoCompatible = [
            'PLANTILLA_IMPRESION_NO_COMPATIBLE',
            'DOCUMENTO_IMPRESION_NO_COMPATIBLE',
        ].includes(codigoError);
        await fallarTrabajoImpresion(trabajo.id, {
            idReserva: trabajo.idReserva,
            codigoError,
            detalleTecnico: String(error?.stack || error).slice(0, 1000),
            reintentable: !envioIniciado && !errorNoCompatible,
            ambiguo: envioIniciado,
            estadoTrabajoQz: null,
        }).catch(() => {});
    } finally {
        if (renovacion) clearInterval(renovacion);
    }
}

async function ejecutarTrabajador(signal) {
    await asegurarSesionEstacion();
    await conectarQz();
    const sincronizar = async () => sincronizarInventarioImpresoras(await buscarImpresoras(), await obtenerVersionQz());
    await sincronizar();
    let proximoLatido = Date.now() + MILISEGUNDOS_LATIDO;
    let despertar = () => {};
    const hub = new signalR.HubConnectionBuilder()
        .withUrl(urlHub(), { accessTokenFactory: asegurarSesionEstacion })
        .withAutomaticReconnect()
        .build();
    hub.on('TrabajosImpresionDisponibles', () => despertar());
    await hub.start().catch(() => {});
    try {
        while (!signal.aborted) {
            const trabajos = await reservarTrabajosImpresion(3);
            for (const trabajo of trabajos) {
                if (signal.aborted) break;
                await procesarTrabajo(trabajo);
            }
            if (Date.now() >= proximoLatido) {
                await sincronizar().catch(() => {});
                proximoLatido = Date.now() + MILISEGUNDOS_LATIDO;
            }
            await new Promise((resolve) => {
                despertar = resolve;
                const id = setTimeout(resolve, trabajos.length ? 300 : MILISEGUNDOS_CONSULTA);
                signal.addEventListener('abort', () => { clearTimeout(id); resolve(); }, { once: true });
            });
        }
    } finally {
        await hub.stop().catch(() => {});
    }
}

export function puedeEjecutarTrabajadorImpresion() {
    return impresionDistribuidaHabilitada && trabajadorImpresionHabilitado
        && Boolean(obtenerIdEstacionRegistrada() && obtenerCredencialEstacion());
}

export function iniciarTrabajadorImpresion() {
    if (detencionActiva || !puedeEjecutarTrabajadorImpresion()) return () => {};
    const controller = new AbortController();
    detencionActiva = () => { controller.abort(); detencionActiva = null; };
    const ejecutar = () => ejecutarTrabajador(controller.signal).catch(async (error) => {
        const codigo = error?.response?.data?.error?.codigo;
        if (['ESTACION_DESHABILITADA', 'CREDENCIAL_ESTACION_INVALIDA'].includes(codigo)) {
            controller.abort(); detencionActiva = null; return undefined;
        }
        if (!controller.signal.aborted) {
            await esperar(5000, controller.signal);
            if (!controller.signal.aborted) return ejecutar();
        }
        return undefined;
    });
    if (navigator.locks?.request) {
        navigator.locks.request(NOMBRE_BLOQUEO, { mode: 'exclusive', signal: controller.signal }, ejecutar).catch(() => {});
    } else {
        ejecutar();
    }
    return detencionActiva;
}

export function reiniciarTrabajadorImpresion() {
    detencionActiva?.();
    return iniciarTrabajadorImpresion();
}

export function detenerTrabajadorImpresion() { detencionActiva?.(); }
