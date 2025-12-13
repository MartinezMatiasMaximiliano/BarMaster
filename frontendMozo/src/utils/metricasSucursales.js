/**
 * Funciones auxiliares para calcular métricas de sucursales
 */

/**
 * Calcula ingresos totales en un período
 * @param {Array} visitas - Array de visitas con Total y FechaHora
 * @param {Date} fechaInicio - Fecha de inicio del período
 * @param {Date} fechaFin - Fecha de fin del período
 * @returns {number} Total de ingresos
 */
export function calcularIngresos(visitas, fechaInicio = null, fechaFin = null) {
    if (!visitas || !Array.isArray(visitas)) return 0;
    
    let visitasFiltradas = visitas;
    
    if (fechaInicio && fechaFin) {
        visitasFiltradas = visitas.filter(visita => {
            const fechaVisita = new Date(visita.FechaHora || visita.fechaHora || visita.fecha);
            return fechaVisita >= fechaInicio && fechaVisita <= fechaFin;
        });
    }
    
    return visitasFiltradas.reduce((total, visita) => {
        return total + (Number(visita.Total) || Number(visita.total) || 0);
    }, 0);
}

/**
 * Calcula el ticket promedio
 * @param {Array} visitas - Array de visitas
 * @param {Date} fechaInicio - Fecha de inicio del período
 * @param {Date} fechaFin - Fecha de fin del período
 * @returns {number} Ticket promedio
 */
export function calcularTicketPromedio(visitas, fechaInicio = null, fechaFin = null) {
    const visitasFiltradas = fechaInicio && fechaFin
        ? visitas.filter(v => {
            const fecha = new Date(v.FechaHora || v.fechaHora || v.fecha);
            return fecha >= fechaInicio && fecha <= fechaFin;
        })
        : visitas;
    
    if (!visitasFiltradas || visitasFiltradas.length === 0) return 0;
    
    const total = calcularIngresos(visitasFiltradas);
    return total / visitasFiltradas.length;
}

/**
 * Cuenta el número de visitas en un período
 * @param {Array} visitas - Array de visitas
 * @param {Date} fechaInicio - Fecha de inicio del período
 * @param {Date} fechaFin - Fecha de fin del período
 * @returns {number} Cantidad de visitas
 */
export function contarVisitas(visitas, fechaInicio = null, fechaFin = null) {
    if (!visitas || !Array.isArray(visitas)) return 0;
    
    let visitasFiltradas = visitas;
    
    if (fechaInicio && fechaFin) {
        visitasFiltradas = visitas.filter(visita => {
            const fechaVisita = new Date(visita.FechaHora || visita.fechaHora || visita.fecha);
            return fechaVisita >= fechaInicio && fechaVisita <= fechaFin;
        });
    }
    
    return visitasFiltradas.length;
}

/**
 * Calcula el porcentaje de crecimiento comparando dos períodos
 * @param {number} valorActual - Valor del período actual
 * @param {number} valorAnterior - Valor del período anterior
 * @returns {number} Porcentaje de crecimiento (puede ser negativo)
 */
export function calcularCrecimiento(valorActual, valorAnterior) {
    if (!valorAnterior || valorAnterior === 0) {
        return valorActual > 0 ? 100 : 0;
    }
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
}

/**
 * Obtiene el estado de la caja (abierta/cerrada)
 * @param {Object} cajaActiva - Objeto de caja activa o null
 * @returns {Object} { estado: 'abierta'|'cerrada', monto: number, fecha: string }
 */
export function obtenerEstadoCaja(cajaActiva) {
    if (!cajaActiva) {
        return {
            estado: 'cerrada',
            monto: 0,
            fecha: null
        };
    }
    
    return {
        estado: cajaActiva.estado || 'abierta',
        monto: Number(cajaActiva.montoEsperado || cajaActiva.totalEsperado || cajaActiva.montoInicial || 0),
        fecha: cajaActiva.fechaApertura || cajaActiva.fecha || null
    };
}

/**
 * Cuenta visitas activas (estado diferente de 'cerrada' o 'pagada')
 * @param {Array} visitas - Array de visitas
 * @returns {number} Cantidad de visitas activas
 */
export function contarVisitasActivas(visitas) {
    if (!visitas || !Array.isArray(visitas)) return 0;
    
    return visitas.filter(visita => {
        const estado = (visita.Estado || visita.estado || '').toLowerCase();
        return estado !== 'cerrada' && estado !== 'pagada' && estado !== 'finalizada';
    }).length;
}

/**
 * Cuenta deliveries pendientes
 * @param {Array} deliveries - Array de deliveries
 * @returns {number} Cantidad de deliveries pendientes
 */
export function contarDeliveriesPendientes(deliveries) {
    if (!deliveries || !Array.isArray(deliveries)) return 0;
    
    return deliveries.filter(delivery => {
        return !(delivery.Entregado || delivery.entregado || false);
    }).length;
}

/**
 * Obtiene el período anterior basado en el período actual
 * @param {Date} fechaInicio - Fecha de inicio del período actual
 * @param {Date} fechaFin - Fecha de fin del período actual
 * @returns {Object} { fechaInicioAnterior, fechaFinAnterior }
 */
export function obtenerPeriodoAnterior(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return { fechaInicioAnterior: null, fechaFinAnterior: null };
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const duracion = fin - inicio;
    
    const fechaFinAnterior = new Date(inicio);
    fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1);
    
    const fechaInicioAnterior = new Date(fechaFinAnterior);
    fechaInicioAnterior.setTime(fechaInicioAnterior.getTime() - duracion);
    
    return {
        fechaInicioAnterior,
        fechaFinAnterior
    };
}

/**
 * Formatea un número como moneda
 * @param {number} monto - Monto a formatear
 * @returns {string} Monto formateado
 */
export function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(monto);
}

/**
 * Formatea un porcentaje
 * @param {number} porcentaje - Porcentaje a formatear
 * @param {number} decimales - Número de decimales (default: 1)
 * @returns {string} Porcentaje formateado
 */
export function formatearPorcentaje(porcentaje, decimales = 1) {
    return `${porcentaje >= 0 ? '+' : ''}${porcentaje.toFixed(decimales)}%`;
}

/**
 * Prepara datos para gráfico de línea (últimos 7 días)
 * @param {Array} visitas - Array de visitas
 * @returns {Array} Datos formateados para el gráfico
 */
export function prepararDatosUltimos7Dias(visitas) {
    if (!visitas || !Array.isArray(visitas)) return [];
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        fecha.setHours(0, 0, 0, 0);
        
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        
        const visitasDelDia = visitas.filter(v => {
            const fechaVisita = new Date(v.FechaHora || v.fechaHora || v.fecha);
            return fechaVisita >= fecha && fechaVisita <= fechaFin;
        });
        
        const total = visitasDelDia.reduce((sum, v) => sum + (Number(v.Total) || Number(v.total) || 0), 0);
        
        ultimos7Dias.push({
            fecha: fecha.toISOString(),
            total: total
        });
    }
    
    return ultimos7Dias;
}

/**
 * Prepara datos para gráfico de barras (ingresos por día de la semana)
 * @param {Array} visitas - Array de visitas
 * @returns {Array} Datos formateados para el gráfico
 */
export function prepararDatosPorDiaSemana(visitas) {
    if (!visitas || !Array.isArray(visitas)) return [];
    
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const ingresosPorDia = [0, 0, 0, 0, 0, 0, 0];
    
    visitas.forEach(visita => {
        const fecha = new Date(visita.FechaHora || visita.fechaHora || visita.fecha);
        const diaSemana = fecha.getDay();
        const total = Number(visita.Total) || Number(visita.total) || 0;
        ingresosPorDia[diaSemana] += total;
    });
    
    return diasSemana.map((dia, index) => ({
        name: dia,
        value: ingresosPorDia[index]
    }));
}

