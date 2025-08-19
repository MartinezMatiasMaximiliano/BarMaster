import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Productos/"
import connection from '../connections/HubConnMozo'

class CrearProductoDTO {
    constructor(nombre, descripcion, precio, activo, categorias, imagen) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.activo = activo;
        this.categorias = categorias;
        this.imagen = imagen;
    }
}

export async function BuscarTodosLosProductos() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function BuscarUnProducto(Id) {
    try {
        const response = await axios.get(BASE_URL + Id);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export function CrearProducto(datos) {
    axios.post(
        BASE_URL,
        new CrearProductoDTO(datos.Nombre, datos["Descripción"], datos.Precio, true, datos.categorias, datos.imagen), {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
        .then(data => console.log(data))
        .catch(error => console.log(error));
    connection.send("RecargarMenu");
}

export async function ModificarProducto(datos) {
    try {
        const response = await axios.put(BASE_URL + datos.id,
            {
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                precio: datos.precio,
                categorias: datos.categorias,
                imagen: datos.imagen,
            }, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ActivarProducto(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: true }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        connection.send("RecargarMenu")
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function DesactivarProducto(Id) {
    try {
        const response = await axios.put(BASE_URL + Id, { activo: false }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        connection.send("RecargarMenu")
        return response.data;
    } catch (error) {
        return error.response
    }
}


export async function BorrarProducto(Id, Token) {
    try {
        const response = await axios.delete(BASE_URL + Id, { headers: { Authorization: 'Bearer ' + Token } });
        connection.send("RecargarMenu");
        return response.data;
    } catch (error) {
        return error.response
    }
}



