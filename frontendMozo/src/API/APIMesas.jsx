import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Mesas/"

class CrearMesaDTO {
    constructor(numeroMesa) {
        this.numeroMesa = numeroMesa;
    }
}

export async function BuscarTodasLasMesas() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        return error.response.data
    }
}

export async function CrearMesa(datos) {
    try {
        const response = await axios.post(BASE_URL, new CrearMesaDTO(datos.numero));
        return response.data;
    } catch (error) {
        alert(error.response.data.error.mensaje)
    }
}

export async function AbrirMesa(Id, codigoMozo) {
    try {
        const response = await axios.put(`${BASE_URL}${Id}/Abrir?codigoMozo=${codigoMozo}` );
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function CerrarMesa(Id) {
    try {
        const response = await axios.put(`${BASE_URL}${Id}/Cerrar?codigoMozo=null`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function ModificarMesa(datos) {
    try {
        const response = await axios.put(BASE_URL + datos.id, { MozoId: datos.idMozo});
        return response.data;
    } catch (error) {
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
        const response = await axios.put(BASE_URL + MesaId, { MozoId: -1 });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function DesactivarMesa(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: false });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ActivarMesa(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: true });
        return response.data;
    } catch (error) {
        return error.response
    }
}


export async function BorrarMesa(IdMesa, token) {
    try {
        const response = await axios.delete(BASE_URL + IdMesa,{
            headers: {
                Authorization: 'Bearer ' + token} })
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}



