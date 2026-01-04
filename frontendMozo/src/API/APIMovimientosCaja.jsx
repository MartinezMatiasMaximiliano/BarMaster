import axios from 'axios';
import { authService } from '../services/authService';
import { ObtenerCajaActiva } from './APICaja';

const BASE_URL = `${import.meta.env.VITE_BASE_URL}MovimientosCaja`;

// Tipos de movimiento de caja (hardcodeados según el seed del backend)
export const TIPOS_MOVIMIENTO_CAJA = [
    { id: 1, nombre: "Ingreso de Efectivo", esIngreso: true, esEfectivo: true },
    { id: 2, nombre: "Retiro de Efectivo", esIngreso: false, esEfectivo: true },
    { id: 3, nombre: "Cobro Cuenta Corriente Efectivo", esIngreso: true, esEfectivo: true },
    { id: 4, nombre: "Cobro Cuenta Corriente Transferencia", esIngreso: true, esEfectivo: false },
    { id: 5, nombre: "Cobro Cuenta Corriente Tarjeta De Credito/Debito", esIngreso: true, esEfectivo: false },
    { id: 6, nombre: "Pago Proveedor Efectivo", esIngreso: false, esEfectivo: true },
    { id: 7, nombre: "Pago Proveedor Transferencia", esIngreso: false, esEfectivo: false },
    { id: 8, nombre: "Pago Proveedor Tarjeta De Credito/Debito", esIngreso: false, esEfectivo: false },
    { id: 9, nombre: "Pago Sueldos Efectivo", esIngreso: false, esEfectivo: true },
    { id: 10, nombre: "Pago Sueldos Transferencia", esIngreso: false, esEfectivo: false },
    { id: 11, nombre: "Pago Sueldos Cuenta Corriente", esIngreso: false, esEfectivo: false },
    { id: 12, nombre: "Pago Sueldos Tarjeta De Credito/Debito", esIngreso: false, esEfectivo: false },
    { id: 13, nombre: "Gastos Efectivo", esIngreso: false, esEfectivo: true },
    { id: 14, nombre: "Gastos Transferencia", esIngreso: false, esEfectivo: false },
    { id: 15, nombre: "Gastos Tarjeta de Credito/Debito", esIngreso: false, esEfectivo: false },
];

export async function CrearMovimientoCaja(datos) {
    try {
        // Primero obtener la caja activa para usar su ID
        const cajaActiva = await ObtenerCajaActiva();
        
        if (!cajaActiva || !cajaActiva.id) {
            throw new Error('No hay una caja abierta. Debes abrir una caja primero.');
        }

        const payload = {
            idTipoMovimientoCaja: datos.idTipoMovimientoCaja,
            idCaja: cajaActiva.id,
            monto: Number(datos.monto),
            descripcion: datos.descripcion || ''
        };

        const response = await axios.post(BASE_URL, payload, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al crear movimiento de caja:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

