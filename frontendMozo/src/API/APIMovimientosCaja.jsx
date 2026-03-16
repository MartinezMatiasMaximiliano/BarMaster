import api from '../services/axiosInstance';
import { ObtenerCajaActiva } from './APICaja';

export async function ObtenerTiposMovimientoCaja() {
    try {
        const response = await api.get('TipoMovimientosCaja', {
            params: { Entorno: 'Movimiento' }
        });
        const tipos = response.data || [];
        
        // Transformar los tipos al formato esperado (normalizar camelCase/PascalCase)
        return tipos.map(tipo => ({
            id: tipo.id || tipo.Id,
            nombre: tipo.nombre || tipo.Nombre || '',
            esIngreso: tipo.esIngreso ?? tipo.EsIngreso ?? false,
            esEfectivo: tipo.esEfectivo ?? tipo.EsEfectivo ?? false
        }));
    } catch (error) {
        console.error('Error al obtener tipos de movimiento de caja:', error);
        throw error;
    }
}

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
            descripcion: datos.descripcion || '',
            idVisita: datos.idVisita ?? null,
            listaIdsProductos: datos.listaIdsProductos ?? []
        };

        const response = await api.post('MovimientosCaja', payload);
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

