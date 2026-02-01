import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL + "Mesa/"

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
        console.log("DATOS", datos);
        const response = await axios.post(
            BASE_URL, 
            new CrearMesaDTO(datos.numero, datos.idPlano), 
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        if (error.response?.data?.error?.mensaje) {
            alert(error.response.data.error.mensaje);
        } else if (error.response?.data) {
            alert(error.response.data);
        } else {
            alert("Error al crear la mesa");
        }
        return error.response;
    }
}

export async function AbrirCerrarMesa(request) {
    try {
        console.log("REQUEST EN API", request);
        const response = await axios.patch(`${BASE_URL}AbrirCerrar`, request, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        if (error.response?.data?.error?.mensaje) {
            alert(error.response.data.error.mensaje);
        } else if (error.response?.data) {
            alert(error.response.data);
        }
        throw error;
    }
}

export async function ModificarMesa(datos) {
    try {
        const body = {
            Id: datos.id
        };
        if (datos.idMozo !== undefined) {
            body.MozoId = datos.idMozo;
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
        const response = await axios.patch(import.meta.env.VITE_BASE_URL + "Mesa", body, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data?.error?.mensaje) {
            alert(error.response.data.error.mensaje);
        } else if (error.response?.data) {
            alert(error.response.data);
        }
        return error.response
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
        const response = await axios.put(BASE_URL + MesaId, { MozoId: -1 }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function DesactivarMesa(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: false }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ActivarMesa(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: true }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response
    }
}


export async function BorrarMesa(IdMesa, Token) {
    // Token se mantiene como parámetro para compatibilidad, pero se obtiene de localStorage
    try {
        const response = await axios.delete(BASE_URL + IdMesa, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function BuscarTodasLasMesas() {
    try {
        const response = await axios.get(
            import.meta.env.VITE_BASE_URL + "Mesas",
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error("Error al obtener mesas:", error);
        if (error.response?.data?.error?.mensaje) {
            alert(error.response.data.error.mensaje);
        }
        return [];
    }
}



