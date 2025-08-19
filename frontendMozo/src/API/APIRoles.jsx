import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Roles/"

export async function BuscarTodosLosRoles() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function CrearRol(nombre) {
    try {
        const response = await axios.post(BASE_URL , { nombre:nombre });
        return response.data;
    } catch (error) {
        alert(error.response.data.error.mensaje);
        return error.response.data
    }
}

export async function BuscarUnRol(Id) {
    try {
        const response = await axios.get(BASE_URL + Id);
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ModificarRol(Id, Nombre) {
    try {
        const response = await axios.put(BASE_URL + Id, { nombre: Nombre});
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function BorrarRol(Id, Token) {
    try {
        const response = await axios.delete(BASE_URL + Id, { headers: { Authorization: 'Bearer ' + Token } })
        return response.data;
    } catch (error) {
        return error.response
    }
}
