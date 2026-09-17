import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarMesasDisponibles(fechaHora) {
    try {
        const instante = new Date(fechaHora).getTime();
        if (!Number.isFinite(instante)) throw new Error('Seleccioná un día y una hora válidos.');
        const [mesas, reservas] = await Promise.all([api.get('Mesa'), api.get('Reservas')]);
        if (!Array.isArray(mesas.data) || !Array.isArray(reservas.data)) {
            throw new Error('No se pudo consultar la disponibilidad.');
        }
        const minuto = Math.floor(instante / 60000);
        const reservasActivas = reservas.data.filter(r => r.idMesa && Number(r.estado?.id) !== 3)
            .map(r => ({ ...r, minuto: Math.floor(new Date(r.fechaHora).getTime() / 60000) }))
            .filter(r => Number.isFinite(r.minuto));
        const ocupadas = new Set(reservasActivas.filter(r => r.minuto === minuto).map(r => r.idMesa));

        const prioridad = { verde: 0, amarilla: 1, roja: 2 };
        return mesas.data.filter(m => m.plano && !ocupadas.has(m.id)).map(m => {
            const distancias = reservasActivas.filter(r => r.idMesa === m.id)
                .map(r => Math.abs(r.minuto - minuto));
            const distanciaReservaMinutos = distancias.length ? Math.min(...distancias) : null;
            const estadoDisponibilidad = distanciaReservaMinutos !== null && distanciaReservaMinutos <= 30
                ? 'roja'
                : distanciaReservaMinutos !== null && distanciaReservaMinutos < 90 ? 'amarilla' : 'verde';
            return { ...m, estadoDisponibilidad, distanciaReservaMinutos };
        }).sort((a, b) => (a.plano.nombre || '').localeCompare(b.plano.nombre || '', 'es')
            || prioridad[a.estadoDisponibilidad] - prioridad[b.estadoDisponibilidad]
            || a.numero - b.numero);
    } catch (error) {
        throw construirError(error, 'Error al consultar la disponibilidad');
    }
}

export async function BuscarTodasLasReservas() {
    try {
        const response = await api.get('Reservas');
        return response.data;
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al buscar reservas'));
        throw construirError(error, 'Error al buscar reservas');
    }
}

export async function CrearReserva(datos) {
    try {
        const response = await api.post('Reservas', datos);
        return response.data;
    } catch (error) {
        console.error('Error al crear reserva:', construirError(error, 'Error al crear la reserva'));
        throw construirError(error, 'Error al crear la reserva');
    }
}

export async function ModificarReserva(datos) {
    try {
        const response = await api.put('Reservas', { ...datos, ...(Object.hasOwn(datos, 'idMesa') ? { idMesa: datos.idMesa || null } : {}) });
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al modificar la reserva");
    }
}

export async function BorrarReserva(Id) {
    try {
        const response = await api.delete(`Reservas?Id=${Id}`);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al eliminar la reserva");
    }
}
