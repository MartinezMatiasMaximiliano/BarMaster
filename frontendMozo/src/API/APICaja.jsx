import api from '../services/axiosInstance';
import { construirError } from './APIError';

// Función auxiliar para formatear fecha y hora desde DateTime
function formatearFechaHora(dateTimeString) {
    if (!dateTimeString) return { fecha: '', hora: '' };
    const fecha = new Date(dateTimeString);
    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = fecha.toTimeString().split(' ')[0].substring(0, 8); // Incluir segundos (HH:MM:SS)
    return { fecha: fechaStr, hora: horaStr };
}

// Transforma la response del backend al formato del frontend.
// Response esperada (camelCase): { id, idSucursal, fechaApertura, fechaCierre, montoApertura, montoActual, montoCierre, diferencia }
function MappearCaja(caja) {
    const fechaApertura = formatearFechaHora(caja.fechaApertura);
    const fechaCierre = caja.fechaCierre ? formatearFechaHora(caja.fechaCierre) : null;

    return {
        id: caja.id,
        fechaApertura: fechaApertura.fecha,
        horaApertura: fechaApertura.hora,
        fecha: fechaApertura.fecha,
        fechaCierre: fechaCierre?.fecha ?? null,
        horaCierre: fechaCierre?.hora ?? null,
        montoInicial: Number(caja.montoApertura) || 0,
        montoActual: caja.montoActual != null ? Number(caja.montoActual) : undefined,
        montoFinal: caja.montoCierre != null ? Number(caja.montoCierre) : null,
        montoEsperado: caja.montoCierre != null ? Number(caja.montoCierre) : Number(caja.montoApertura) || 0,
        totalEsperado: caja.montoCierre != null ? Number(caja.montoCierre) : Number(caja.montoApertura) || 0,
        diferencia: caja.diferencia != null ? Number(caja.diferencia) : 0,
        observaciones: '',
        responsable: '',
        usuario: '',
        estado: caja.fechaCierre ? 'cerrada' : 'abierta'
    };
}

export async function ObtenerCajaActiva() {
    try {
        const response = await api.get('Cajas/Activa');
        
        // Si no hay caja activa, el endpoint retorna 404
        if (response.status === 404) {
            return null;
        }
        
        return MappearCaja(response.data);
    } catch (error) {
        // Si el error es 404, significa que no hay caja activa
        if (error.response?.status === 404) {
            return null;
        }
        console.error('Error al obtener caja activa:', construirError(error, 'Error al obtener caja activa'));
        throw construirError(error, 'Error al obtener caja activa');
    }
}

export async function AbrirCaja(datos) {
    try {
        const payload = {
            montoApertura: datos.montoInicial
        };
        
        const response = await api.post('Cajas/Abrir', payload);
        const cajaCreada = response.data;
        
        // Transformar la respuesta al formato esperado
        return MappearCaja(cajaCreada);
    } catch (error) {
        console.error('Error al abrir la caja:', construirError(error, 'Error al abrir la caja'));
        throw construirError(error, 'Error al abrir la caja');
    }
}

export async function CerrarCaja(idCaja, datos) {
    try {
        // El endpoint PATCH /Cajas/Cerrar espera un objeto con IdCaja y MontoCierre
        // Asegurar que idCaja sea un string válido
        const idCajaString = typeof idCaja === 'string' ? idCaja : idCaja.toString();
        
        const payload = {
            idCaja: idCajaString,
            montoCierre: Number(datos.montoFinal) || 0
        };
        
        const response = await api.patch(
            'Cajas/Cerrar',
            payload
        );
        
        return response.data;
    } catch (error) {
        console.error('Error al cerrar la caja:', construirError(error, 'Error al cerrar la caja'));
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw construirError(error, 'Error al cerrar la caja');
    }
}

export async function ObtenerHistorialCaja(params = {}) {
    try {
        const response = await api.get('Cajas');
        const cajas = response.data || [];
        
        // Filtrar solo las cajas cerradas (con fecha de cierre)
        const cajasFiltradas = cajas.filter(caja => caja.fechaCierre || caja.FechaCierre);
        
        // Para cada caja cerrada, calcular el monto esperado basado en los movimientos
        const cajasConDiferencia = await Promise.all(
            cajasFiltradas.map(async (caja) => {
                const cajaTransformada = MappearCaja(caja);
                
                // Obtener los movimientos de esta caja para calcular el monto esperado
                try {
                    const movimientos = await ObtenerMovimientosCaja(cajaTransformada.id);
                    
                    // Calcular monto esperado: monto inicial + suma de movimientos de efectivo
                    let montoEsperado = cajaTransformada.montoInicial || 0;
                    
                    movimientos.forEach(mov => {
                        if (mov.esEfectivo) {
                            if (mov.esIngreso) {
                                montoEsperado += mov.monto;
                            } else {
                                montoEsperado -= mov.monto;
                            }
                        }
                    });
                    
                    // Calcular diferencia correcta: MontoFinal - MontoEsperado
                    const montoFinal = cajaTransformada.montoFinal || 0;
                    const diferencia = montoFinal - montoEsperado;
                    
                    return {
                        ...cajaTransformada,
                        montoEsperado: montoEsperado,
                        diferencia: diferencia
                    };
                } catch (error) {
                    // Si hay error al obtener movimientos, usar la diferencia del backend
                    console.warn(`Error al obtener movimientos para caja ${cajaTransformada.id}:`, construirError(error, 'Error al obtener movimientos de caja'));
                    return cajaTransformada;
                }
            })
        );
        
        // Ordenar por fecha y hora de cierre descendente (más nuevos primero)
        const cajasCerradas = cajasConDiferencia.sort((a, b) => {
            const fechaCierreA = a.fechaCierre ? `${a.fechaCierre}T${a.horaCierre || '00:00'}` : a.fechaApertura;
            const fechaCierreB = b.fechaCierre ? `${b.fechaCierre}T${b.horaCierre || '00:00'}` : b.fechaApertura;
            
            const fechaA = new Date(fechaCierreA);
            const fechaB = new Date(fechaCierreB);
            
            // Orden descendente: más reciente primero
            return fechaB - fechaA;
        });
        
        // Aplicar límite si se especifica
        const limite = params.limite || 10;
        return cajasCerradas.slice(0, limite);
    } catch (error) {
        console.error('Error al obtener el historial de caja:', construirError(error, 'Error al obtener el historial de caja'));
        throw construirError(error, 'Error al obtener el historial de caja');
    }
}

export async function ObtenerMovimientosCaja(idCaja) {
    try {
        // Asegurar que idCaja sea un string válido
        if (!idCaja) {
            throw new Error('ID de caja no válido');
        }
        
        const idCajaString = typeof idCaja === 'string' ? idCaja : idCaja.toString();
        const response = await api.get(`MovimientosCaja/Caja/${idCajaString}`);
        const movimientos = response.data || [];
        
        // Transformar los movimientos al formato esperado
        const movimientosTransformados = movimientos.map(mov => {
            const fechaMovRaw = mov.fechaMovimiento || mov.FechaMovimiento;
            const fechaMov = formatearFechaHora(fechaMovRaw);
            const tipoMovRaw = mov.tipoMovimientoCaja || mov.TipoMovimientoCaja;
            const nombreTipo = tipoMovRaw?.nombre || tipoMovRaw?.Nombre || '';
            const esEfectivo = tipoMovRaw?.esEfectivo ?? tipoMovRaw?.EsEfectivo ?? false;
            const esIngreso = tipoMovRaw?.esIngreso ?? tipoMovRaw?.EsIngreso ?? false;
            
            return {
                id: mov.id || mov.Id,
                fecha: fechaMov.fecha,
                hora: fechaMov.hora,
                tipo: nombreTipo.toLowerCase() || 'movimiento',
                descripcion: mov.descripcion || mov.Descripcion || '',
                monto: parseFloat(mov.monto || mov.Monto) || 0,
                esEfectivo: esEfectivo,
                esIngreso: esIngreso,
                saldo: 0 // Se calculará después
            };
        });
        
        return movimientosTransformados;
    } catch (error) {
        console.error('Error al obtener movimientos de la caja:', construirError(error, 'Error al obtener movimientos de la caja'));
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw construirError(error, 'Error al obtener movimientos de la caja');
    }
}
