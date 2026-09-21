const mensajes = {
    IMPRESORA_NO_CONFIGURADA: 'No hay una impresora configurada para esta operación.',
    IMPRESORA_NO_ENCONTRADA: 'La impresora configurada no está disponible en Windows.',
    QZ_LIMITE_SOLICITUDES: 'Se realizaron demasiadas solicitudes de impresión. Esperá un momento.',
    LIMITE_SOLICITUDES: 'Se realizaron demasiadas solicitudes. Esperá un momento y volvé a intentar.',
    CREDENCIAL_ESTACION_FALTANTE: 'Este equipo todavía no está habilitado para recibir impresiones.',
    REGLA_IMPRESION_NO_CONFIGURADA: 'Todavía no se configuró una impresora para esta operación.',
    DESTINO_IMPRESION_DESCONECTADO: 'La impresora configurada no está disponible en este momento.',
    ESTACION_NO_AUTORIZADA: 'Esta estación no está habilitada para imprimir.',
    CONFIGURACION_IMPRESION_PROHIBIDA: 'Tu sesión no tiene permiso para configurar impresoras. Volvé a ingresar con el usuario administrador de la sucursal.',
    SIN_PRODUCTOS_IMPRIMIBLES: 'No hay productos pendientes para imprimir.',
};

export function normalizarErrorQz(error) {
    const codigoBackend = error?.response?.data?.error?.codigo;
    const estadoHttp = error?.response?.status;
    const codigo = codigoBackend || (estadoHttp === 403 ? 'CONFIGURACION_IMPRESION_PROHIBIDA' : null)
        || error?.message || 'QZ_NO_DISPONIBLE';
    return {
        codigo,
        mensaje: mensajes[codigo]
            || error?.response?.data?.error?.mensaje
            || 'No fue posible conectar con el servicio de impresión. Comprobá que esté abierto y que el navegador tenga permiso para acceder a dispositivos locales.',
        mensajeTecnico: error?.message || String(error),
    };
}
