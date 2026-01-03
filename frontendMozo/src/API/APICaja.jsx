import axios from 'axios';
import { authService } from '../services/authService';

const BASE_URL = `${import.meta.env.VITE_BASE_URL}Cajas`;
const MOVIMIENTOS_URL = `${import.meta.env.VITE_BASE_URL}MovimientosCaja`;

// Función auxiliar para formatear fecha y hora desde DateTime
function formatearFechaHora(dateTimeString) {
    if (!dateTimeString) return { fecha: '', hora: '' };
    const fecha = new Date(dateTimeString);
    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = fecha.toTimeString().split(' ')[0].substring(0, 5);
    return { fecha: fechaStr, hora: horaStr };
}

// Función auxiliar para transformar caja del backend al formato del frontend
function transformarCaja(caja) {
    const id = caja.id || caja.Id;
    const fechaAperturaRaw = caja.fechaApertura || caja.FechaApertura;
    const fechaCierreRaw = caja.fechaCierre || caja.FechaCierre;
    const montoAperturaRaw = caja.montoApertura || caja.MontoApertura;
    const montoCierreRaw = caja.montoCierre || caja.MontoCierre;
    const diferenciaRaw = caja.diferencia || caja.Diferencia;
    
    const fechaApertura = formatearFechaHora(fechaAperturaRaw);
    const fechaCierre = fechaCierreRaw ? formatearFechaHora(fechaCierreRaw) : null;
    
    return {
        id: id,
        fechaApertura: fechaApertura.fecha,
        horaApertura: fechaApertura.hora,
        fecha: fechaApertura.fecha,
        fechaCierre: fechaCierre?.fecha || null,
        horaCierre: fechaCierre?.hora || null,
        montoInicial: parseFloat(montoAperturaRaw) || 0,
        montoFinal: montoCierreRaw ? parseFloat(montoCierreRaw) : null,
        montoEsperado: montoCierreRaw ? parseFloat(montoCierreRaw) : parseFloat(montoAperturaRaw) || 0,
        totalEsperado: montoCierreRaw ? parseFloat(montoCierreRaw) : parseFloat(montoAperturaRaw) || 0,
        diferencia: diferenciaRaw ? parseFloat(diferenciaRaw) : 0,
        observaciones: '',
        responsable: '',
        usuario: '',
        estado: fechaCierreRaw ? 'cerrada' : 'abierta'
    };
}

export async function ObtenerCajaActiva() {
    try {
        const response = await axios.get(BASE_URL, authService.getAuthHeaders());
        const cajas = response.data || [];
        
        // Buscar la caja abierta (sin fecha de cierre)
        const cajaAbierta = cajas.find(caja => !(caja.fechaCierre || caja.FechaCierre));
        
        if (!cajaAbierta) {
            return null;
        }
        
        return transformarCaja(cajaAbierta);
    } catch (error) {
        console.error('Error al obtener caja activa:', error);
        throw error;
    }
}

export async function AbrirCaja(datos) {
    try {
        const payload = {
            montoApertura: datos.montoInicial
        };
        
        const response = await axios.post(`${BASE_URL}/Abrir`, payload, authService.getAuthHeaders());
        const cajaCreada = response.data;
        
        // Transformar la respuesta al formato esperado
        return transformarCaja(cajaCreada);
    } catch (error) {
        console.error('Error al abrir la caja:', error);
        throw error;
    }
}

export async function CerrarCaja(idCaja, datos) {
    try {
        // El endpoint PATCH /Cajas/Cerrar espera solo el Guid de la caja en el body
        // Asegurar que idCaja sea un string válido
        const idCajaString = typeof idCaja === 'string' ? idCaja : idCaja.toString();
        
        // Enviar el Guid como string en el body
        const response = await axios.patch(
            `${BASE_URL}/Cerrar`,
            idCajaString,
            {
                ...authService.getAuthHeaders(),
                headers: {
                    ...authService.getAuthHeaders().headers,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error al cerrar la caja:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

export async function ObtenerHistorialCaja(params = {}) {
    try {
        const response = await axios.get(BASE_URL, authService.getAuthHeaders());
        const cajas = response.data || [];
        
        // Filtrar solo las cajas cerradas (con fecha de cierre)
        const cajasCerradas = cajas
            .filter(caja => caja.fechaCierre || caja.FechaCierre)
            .map(caja => transformarCaja(caja))
            .sort((a, b) => {
                // Ordenar por fecha de cierre descendente
                const fechaA = new Date(b.fechaCierre || b.fechaApertura);
                const fechaB = new Date(a.fechaCierre || a.fechaApertura);
                return fechaA - fechaB;
            });
        
        // Aplicar límite si se especifica
        const limite = params.limite || 10;
        return cajasCerradas.slice(0, limite);
    } catch (error) {
        console.error('Error al obtener el historial de caja:', error);
        throw error;
    }
}

export async function ObtenerMovimientosCaja(idCaja) {
    try {
        // Asegurar que idCaja sea un string válido
        if (!idCaja) {
            throw new Error('ID de caja no válido');
        }
        
        const idCajaString = typeof idCaja === 'string' ? idCaja : idCaja.toString();
        const url = `${MOVIMIENTOS_URL}/Caja/${idCajaString}`;
        
        console.log('Obteniendo movimientos de caja:', url, 'ID:', idCajaString);
        
        const response = await axios.get(url, authService.getAuthHeaders());
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
        console.error('Error al obtener movimientos de la caja:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}
