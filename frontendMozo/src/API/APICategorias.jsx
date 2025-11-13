import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Categorias/"


export async function BuscarTodasLasCategorias() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function CrearCategoria(datos) {
    try {
        const response = await axios.post(BASE_URL, { nombre: datos.nombre, activo: true });
        return response.data;
    } catch (error) {
        alert(error.response.data.error.mensaje);
        return error.response
    }
}

export async function BuscarUnaCategoria(Id) {
    try {
        const response = await axios.get(BASE_URL + Id);
        return response.data;
    } catch (error) {
        return error.response
    }
}


export async function ModificarCategoria(datos) {
    try {
        const response = await axios.put(BASE_URL + datos.id, { nombre: datos.nombre});
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ActivarCategoria(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: true });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function DesactivarCategoria(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: false });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function BorrarCategoria(Id, Token) {
    try {
        const response = await axios.delete(BASE_URL + Id, { headers: { Authorization: 'Bearer ' + Token } })
        return response.data;
    } catch (error) {
        return error.response
    }
}


