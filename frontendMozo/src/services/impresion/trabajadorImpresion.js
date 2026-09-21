import { crearEsperaTrabajador } from './esperaTrabajador';
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
import { registrarDiagnosticoImpresion } from './registroDiagnosticoImpresion';

const MILISEGUNDOS_CONSULTA = 15000;
const MILISEGUNDOS_LATIDO = 30000;
const NOMBRE_BLOQUEO = 'barmaster-printing-worker';
let detencionActiva = null;

function urlHub() {
    return new URL('hubs/impresion', import.meta.env.VITE_BASE_URL).toString();
}

export async function procesarTrabajo(trabajo) {
    let envioIniciado = false;
    let renovacion;
    const inicio = performance.now();
    registrarDiagnosticoImpresion('trabajo.procesamiento_iniciado', {
        idTrabajo: trabajo.id,
        idSolicitud: trabajo.idSolicitud,
        tipoDocumento: trabajo.tipoDocumento,
        impresora: trabajo.nombreSistema,
        creadoEn: trabajo.creadoEn,
        antiguedadColaMs: trabajo.creadoEn ? Date.now() - new Date(trabajo.creadoEn).getTime() : null,
    });
    try {
        const opciones = { copias: trabajo.copias, codificacion: trabajo.codificacion, omitirComprobacionImpresora: true, nombreTrabajo: `BarMaster ${trabajo.tipoDocumento} ${trabajo.id}` };
        const datos = formatearTrabajoCrudo(trabajo);
        registrarDiagnosticoImpresion('trabajo.formateado', { idTrabajo: trabajo.id, transcurridoMs: Math.round(performance.now() - inicio) });
        await requerirImpresora(trabajo.nombreSistema);
        registrarDiagnosticoImpresion('trabajo.impresora_verificada', { idTrabajo: trabajo.id, transcurridoMs: Math.round(performance.now() - inicio) });
        await marcarTrabajoEnviando(trabajo.id, trabajo.idReserva);
        envioIniciado = true;
        registrarDiagnosticoImpresion('trabajo.marcado_enviando', { idTrabajo: trabajo.id, transcurridoMs: Math.round(performance.now() - inicio) });
        renovacion = setInterval(() => renovarReservaTrabajo(trabajo.id, trabajo.idReserva).catch(() => {}), 15000);
        const inicioQz = performance.now();
        await imprimirCrudo(trabajo.nombreSistema, datos, opciones);
        registrarDiagnosticoImpresion('trabajo.qz_acepto', {
            idTrabajo: trabajo.id,
            duracionQzMs: Math.round(performance.now() - inicioQz),
            transcurridoMs: Math.round(performance.now() - inicio),
        });
        await marcarTrabajoAceptado(trabajo.id, trabajo.idReserva);
        registrarDiagnosticoImpresion('trabajo.finalizado', { idTrabajo: trabajo.id, duracionTotalMs: Math.round(performance.now() - inicio) });
    } catch (error) {
        const codigoError = error?.message || 'IMPRESION_FALLIDA';
        const errorNoCompatible = [
            'PLANTILLA_IMPRESION_NO_COMPATIBLE',
            'DOCUMENTO_IMPRESION_NO_COMPATIBLE',
            'DOCUMENTO_IMPRESION_INVALIDO',
        ].includes(codigoError);
        registrarDiagnosticoImpresion('trabajo.error', {
            idTrabajo: trabajo.id,
            codigoError,
            envioIniciado,
            transcurridoMs: Math.round(performance.now() - inicio),
        });
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
    registrarDiagnosticoImpresion('trabajador.iniciando');
    await asegurarSesionEstacion();
    registrarDiagnosticoImpresion('trabajador.sesion_asegurada');
    await conectarQz();
    registrarDiagnosticoImpresion('trabajador.qz_conectado');
    const sincronizar = async () => sincronizarInventarioImpresoras(await buscarImpresoras(), await obtenerVersionQz());
    await sincronizar();
    registrarDiagnosticoImpresion('trabajador.inventario_sincronizado');
    let proximoLatido = Date.now() + MILISEGUNDOS_LATIDO;
    let despertar = () => {};
    let numeroNotificacion = 0;
    const hub = new signalR.HubConnectionBuilder()
        .withUrl(urlHub(), {
            accessTokenFactory: asegurarSesionEstacion,
            withCredentials: false,
        })
        .withAutomaticReconnect()
        .build();
    hub.on('TrabajosImpresionDisponibles', () => {
        numeroNotificacion += 1;
        registrarDiagnosticoImpresion('signalr.trabajos_disponibles_recibido');
        despertar();
    });
    hub.onreconnecting((error) => registrarDiagnosticoImpresion('signalr.reconectando', error));
    hub.onreconnected(() => registrarDiagnosticoImpresion('signalr.reconectado'));
    hub.onclose((error) => registrarDiagnosticoImpresion('signalr.cerrado', error));
    const asegurarHubConectado = async () => {
        if (hub.state !== signalR.HubConnectionState.Disconnected) return;
        registrarDiagnosticoImpresion('signalr.conectando');
        await hub.start().catch((error) => registrarDiagnosticoImpresion('signalr.error_inicio', error));
        registrarDiagnosticoImpresion('signalr.inicio_completado', { estado: hub.state });
    };

    await asegurarHubConectado();
    try {
        while (!signal.aborted) {
            await asegurarHubConectado();
            const notificacionAlIniciar = numeroNotificacion;
            const inicioReserva = performance.now();
            const trabajos = await reservarTrabajosImpresion(3);
            registrarDiagnosticoImpresion('trabajador.reserva_completada', {
                cantidad: trabajos.length,
                duracionMs: Math.round(performance.now() - inicioReserva),
            });
            for (const trabajo of trabajos) {
                if (signal.aborted) break;
                await procesarTrabajo(trabajo);
            }
            if (Date.now() >= proximoLatido) {
                await sincronizar().catch(() => {});
                proximoLatido = Date.now() + MILISEGUNDOS_LATIDO;
            }
            const esperaMs = trabajos.length
                ? 300
                : hub.state === signalR.HubConnectionState.Disconnected ? 5000 : MILISEGUNDOS_CONSULTA;
            const espera = crearEsperaTrabajador(esperaMs, signal);
            despertar = espera.finalizar;
            if (numeroNotificacion !== notificacionAlIniciar) despertar();
            await espera.promesa;
            despertar = () => {};
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
            await crearEsperaTrabajador(5000, controller.signal).promesa;
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
