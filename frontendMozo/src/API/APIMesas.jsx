import api from '../services/axiosInstance'
import { construirError } from './APIError';

class CrearMesaDTO {
    constructor(nombre, idPlano, capacidad = 0, x = 0, y = 0, w = 0, h = 0) {
        this.Nombre = nombre;
        this.IdPlano = idPlano || null;
        this.Capacidad = capacidad;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

export async function CrearMesa(datos) {
    try {
        const capacidad = datos.capacidad ? parseInt(datos.capacidad) : 0;
        const response = await api.post(
            'Mesa/',
            new CrearMesaDTO(datos.numero, datos.idPlano, capacidad)
        );
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al crear la mesa");
    }
}

export async function AbrirCerrarMesa(request) {
    try {
        const response = await api.patch('Mesa/AbrirCerrar', request);
        return response.data;
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al abrir/cerrar la mesa'));
        throw construirError(error, "Error al abrir/cerrar la mesa");
    }
}

export async function ModificarMesa(datos) {
    try {
        const body = {
            Id: datos.id
        };
        if (datos.capacidad !== undefined) {
            body.Capacidad = datos.capacidad;
        }
        if (datos.x !== undefined) {
            body.x = datos.x;
        }
        if (datos.y !== undefined) {
            body.y = datos.y;
        }
        if (datos.w !== undefined) {
            body.w = datos.w;
        }
        if (datos.h !== undefined) {
            body.h = datos.h;
        }
        // El backend usa PATCH /Mesa con el Id en el body
        const response = await api.patch('Mesa', body);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al modificar la mesa");
    }
}

//export async function CambiarMozoAsignado(MesaId,IdMozo) {
//    try {
//        const response = await axios.put(BASE_URL + MesaId, { MozoId: IdMozo });
//        return response.data;
//    } catch (error) {
//        return error.response
//    }
//}

export async function PonerMozoEnNull(MesaId) {
    try {
        const response = await api.put('Mesa/' + MesaId, { MozoId: -1 });
        return response.data;
    } catch (error) {
        console.error('Error al poner mozo en null:', construirError(error, 'Error al actualizar la mesa'));
        return error.response
    }
}

export async function DesactivarMesa(Id) {
    try {
        const response = await api.put('Mesa/' + Id, { activo: false });
        return response.data;
    } catch (error) {
        console.error('Error al desactivar mesa:', construirError(error, 'Error al desactivar la mesa'));
        return error.response
    }
}

export async function ActivarMesa(Id) {
    try {
        const response = await api.put('Mesa/' + Id, { activo: true });
        return response.data;
    } catch (error) {
        console.error('Error al activar mesa:', construirError(error, 'Error al activar la mesa'));
        return error.response
    }
}

export async function BorrarMesa(idMesa) {
    try {
        const response = await api.delete(
            'Mesa',
            {
                params: { IdMesa: idMesa }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al borrar mesa:", construirError(error, 'Error al eliminar la mesa'));
        throw construirError(error, "Error al eliminar la mesa");
    }
}

export async function BuscarTodasLasMesas() {
    try {
        const response = await api.get('Mesas');
        return response.data;
    } catch (error) {
        console.error("Error al obtener mesas:", construirError(error, 'Error al obtener mesas'));
        return [];
    }
}
