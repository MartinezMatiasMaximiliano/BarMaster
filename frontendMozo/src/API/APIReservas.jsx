import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarMesasDisponibles(fechaHora) {
    try {
        const instante = new Date(fechaHora).getTime();
        if (!Number.isFinite(instante)) throw new Error('Seleccioná un día y una hora válidos.');
        const response = await api.get('Reservas/Disponibilidad', { params: { fechaHora: new Date(instante).toISOString() } });
        if (!Array.isArray(response.data)) {
            throw new Error('No se pudo consultar la disponibilidad.');
        }
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al consultar la disponibilidad');
    }
}

export async function BuscarTodasLasReservas(desde, hasta) {
    try {
        const response = await api.get('Reservas', {
            params: {
                ...(desde ? { desde } : {}),
                ...(hasta ? { hasta } : {}),
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al buscar reservas'));
        throw construirError(error, 'Error al buscar reservas');
    }
}

const fechaConOffsetArgentina = (anio, mes, dia) => (
    `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T12:00:00-03:00`
);

export function obtenerRangoMesReservas(fecha) {
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const ultimoDia = new Date(anio, mes, 0).getDate();

    return {
        desde: fechaConOffsetArgentina(anio, mes, 1),
        hasta: fechaConOffsetArgentina(anio, mes, ultimoDia),
    };
}

export function obtenerRangoDiasReservas(fechaInicio, fechaFin) {
    return {
        desde: `${fechaInicio}T12:00:00-03:00`,
        hasta: `${fechaFin}T12:00:00-03:00`,
    };
}

export async function RecargarReservasConservando(asignar, buscar = BuscarTodasLasReservas) {
    try {
        const datos = await buscar();
        if (!Array.isArray(datos)) throw new Error('La respuesta de reservas no es válida.');
        asignar(datos);
        return { ok: true, datos };
    } catch (error) {
        return { ok: false, error: construirError(error, 'No se pudo actualizar la agenda') };
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
