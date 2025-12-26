import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Personas/"
const REGISTER_URL = import.meta.env.VITE_BASE_URL + "Register/"
const MOZOS_URL = import.meta.env.VITE_BASE_URL + "Mozos/"


export async function BuscarTodosLosMozos() {
    try {
        const response = await axios.get(MOZOS_URL);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function BuscarTodasLasPersonas() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function RegistrarPersona(datos) {
    try {
        const response = await axios.post(REGISTER_URL, {
            nombres: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            direccion: datos.direccion,
            telefono: datos.telefono,
            activo: true,
            idRol: datos.rol,
            contrasena: datos.dni
        });
        return response.data;
    } catch (error) {
        alert(error.response.data.error.mensaje)
        return error.response;
    }
}

export async function RegistrarMozo(datos) {
    try {
        const response = await axios.post(REGISTER_URL, {
            nombres: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            direccion: datos.direccion,
            telefono: datos.telefono,
            activo: true,
            idRol: -2,
            contrasena: datos.dni
        });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ModificarPersona(datos) {
    try {
        const response = await axios.put(BASE_URL + datos.id,
            {
                idRol: datos.rol,
                nombres: datos.nombre,
                apellido: datos.apellido,
                direccion: datos.direccion,
                dni: datos.dni,
                telefono: datos.telefono,
            });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ModificarPassword(id,nuevoPassword,token) {
    try {
        const response = await axios.put(
            BASE_URL + 'password/' + id,
            JSON.stringify(nuevoPassword),
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}



export async function ModificarCodigoMozo(datos) {
    try {
        const response = await axios.put(BASE_URL + datos.id,
            {
                codigoDeServicio : datos.nuevoCodigo
            });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ActivarPersona(Id) {
    try {
        const response = await axios.put(BASE_URL + Id + "/true");
        return response.data;
    } catch (error) {
        return error.response
    }
}


export async function DesactivarPersona(Id) {
    try {
        const response = await axios.put(BASE_URL + Id + "/false");
        return response.data;
    } catch (error) {
        return error.response
    }
}


export async function BorrarPersona(Id,Token) {
    try {
        const response = await axios.delete(BASE_URL + Id, { headers: { Authorization: 'Bearer ' + Token } });
        return response.data;
    } catch (error) {
        return error.response
    }
}



