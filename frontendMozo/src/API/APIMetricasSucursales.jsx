import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Estructura esperada de métricas por sucursal:
 * {
 *   idSucursal: string (Guid),
 *   nombre: string,
 *   direccion: string,
 *   telefono: string,
 *   // Métricas financieras
 *   ingresosHoy: number,
 *   ingresosSemana: number,
 *   ingresosMes: number,
 *   ticketPromedio: number,
 *   totalVisitas: number,
 *   // Estado de caja
 *   cajaActiva: {
 *     estado: 'abierta' | 'cerrada',
 *     monto: number,
 *     fechaApertura: string
 *   },
 *   // Métricas operativas
 *   visitasActivas: number,
 *   deliveriesPendientes: number,
 *   reservasHoy: number,
 *   // Comparaciones
 *   crecimientoIngresos: number, // porcentaje
 *   // Datos para gráficas
 *   visitas: Array<{ FechaHora: string, Total: number, Estado: string }>,
 *   deliveries: Array<{ Entregado: boolean, PrecioTotal: number }>
 * }
 */

/**
 * Obtiene métricas agregadas para todas las sucursales de una empresa
 * @param {string} idEmpresa - ID de la empresa
 * @param {Date} fechaInicio - Fecha de inicio del período (opcional)
 * @param {Date} fechaFin - Fecha de fin del período (opcional)
 * @returns {Promise<Array>} Array de métricas por sucursal
 */
export async function ObtenerMetricasSucursales(idEmpresa, fechaInicio = null, fechaFin = null) {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const params = {};
    //     if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    //     if (fechaFin) params.fechaFin = fechaFin.toISOString();
    //     
    //     const response = await axios.get(`${BASE_URL}Empresas/${idEmpresa}/metricas-sucursales`, { params });
    //     return response.data;
    // } catch (error) {
    //     console.error("Error al obtener métricas de sucursales:", error);
    //     throw error;
    // }

    // DATOS DE PRUEBA - Retorna métricas simuladas
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simular datos de prueba con estructura realista
            const metricas = generarMetricasPrueba();
            resolve(metricas);
        }, 500);
    });
}

/**
 * Obtiene métricas de una sucursal específica
 * @param {string} idSucursal - ID de la sucursal
 * @param {Date} fechaInicio - Fecha de inicio del período (opcional)
 * @param {Date} fechaFin - Fecha de fin del período (opcional)
 * @returns {Promise<Object>} Métricas de la sucursal
 */
export async function ObtenerMetricasSucursal(idSucursal, fechaInicio = null, fechaFin = null) {
    // TODO: Descomentar cuando esté lista la API
    // try {
    //     const params = {};
    //     if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    //     if (fechaFin) params.fechaFin = fechaFin.toISOString();
    //     
    //     const response = await axios.get(`${BASE_URL}Sucursales/${idSucursal}/metricas`, { params });
    //     return response.data;
    // } catch (error) {
    //     console.error("Error al obtener métricas de la sucursal:", error);
    //     throw error;
    // }

    // DATOS DE PRUEBA
    return new Promise((resolve) => {
        setTimeout(() => {
            const metricas = generarMetricasPrueba();
            const metrica = metricas.find(m => m.idSucursal === idSucursal) || metricas[0];
            resolve(metrica);
        }, 300);
    });
}

/**
 * Genera datos de prueba para métricas
 * @returns {Array} Array de métricas simuladas
 */
function generarMetricasPrueba() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Lunes de esta semana
    
    // Generar visitas de prueba para cada sucursal con distribución más realista
    const generarVisitas = (cantidad, baseIngreso) => {
        const visitas = [];
        const hoy = new Date();
        
        // Generar visitas distribuidas en los últimos 30 días, con más concentración en días recientes
        for (let i = 0; i < cantidad; i++) {
            // Distribución: 40% en últimos 7 días, 30% en días 8-14, 30% en días 15-30
            let diasAtras;
            const rand = Math.random();
            if (rand < 0.4) {
                diasAtras = Math.floor(Math.random() * 7);
            } else if (rand < 0.7) {
                diasAtras = 7 + Math.floor(Math.random() * 7);
            } else {
                diasAtras = 14 + Math.floor(Math.random() * 16);
            }
            
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - diasAtras);
            fecha.setHours(8 + Math.floor(Math.random() * 14));
            fecha.setMinutes(Math.floor(Math.random() * 60));
            
            // Variación más realista del ingreso
            const variacion = (Math.random() - 0.5) * 0.4; // ±20%
            const total = baseIngreso * (1 + variacion);
            
            visitas.push({
                Id: `visita-${i}`,
                FechaHora: fecha.toISOString(),
                Total: Math.max(5000, Math.round(total)), // Mínimo $5000
                Estado: Math.random() > 0.7 ? 'activa' : 'cerrada'
            });
        }
        
        // Ordenar por fecha
        return visitas.sort((a, b) => new Date(a.FechaHora) - new Date(b.FechaHora));
    };
    
    return [
        {
            idSucursal: '1',
            nombre: 'Sucursal Santiago y 25 de Mayo',
            direccion: 'Santiago y 25 de Mayo',
            telefono: '381-445-1200',
            ingresosHoy: 125000,
            ingresosSemana: 850000,
            ingresosMes: 3200000,
            ticketPromedio: 18500,
            totalVisitas: 173,
            cajaActiva: {
                estado: 'abierta',
                monto: 125000,
                fechaApertura: hoy.toISOString().split('T')[0]
            },
            visitasActivas: 8,
            deliveriesPendientes: 3,
            reservasHoy: 12,
            crecimientoIngresos: 15.5,
            visitas: generarVisitas(173, 15000),
            deliveries: Array.from({ length: 15 }, (_, i) => ({
                Entregado: i < 12,
                PrecioTotal: 12000 + Math.random() * 8000
            }))
        },
        {
            idSucursal: '2',
            nombre: 'Sucursal Chacabuco 136',
            direccion: 'Chacabuco 136',
            telefono: '381-422-8899',
            ingresosHoy: 98000,
            ingresosSemana: 720000,
            ingresosMes: 2850000,
            ticketPromedio: 16200,
            totalVisitas: 176,
            cajaActiva: {
                estado: 'abierta',
                monto: 98000,
                fechaApertura: hoy.toISOString().split('T')[0]
            },
            visitasActivas: 5,
            deliveriesPendientes: 2,
            reservasHoy: 8,
            crecimientoIngresos: 8.2,
            visitas: generarVisitas(176, 14000),
            deliveries: Array.from({ length: 12 }, (_, i) => ({
                Entregado: i < 10,
                PrecioTotal: 10000 + Math.random() * 6000
            }))
        },
        {
            idSucursal: '3',
            nombre: 'Sucursal Lavalle y 9 de Julio',
            direccion: 'Lavalle y 9 de Julio',
            telefono: '381-431-7722',
            ingresosHoy: 75000,
            ingresosSemana: 580000,
            ingresosMes: 2100000,
            ticketPromedio: 14200,
            totalVisitas: 148,
            cajaActiva: {
                estado: 'cerrada',
                monto: 0,
                fechaApertura: null
            },
            visitasActivas: 0,
            deliveriesPendientes: 1,
            reservasHoy: 5,
            crecimientoIngresos: -5.3,
            visitas: generarVisitas(148, 12000),
            deliveries: Array.from({ length: 8 }, (_, i) => ({
                Entregado: i < 7,
                PrecioTotal: 9000 + Math.random() * 5000
            }))
        }
    ];
}

