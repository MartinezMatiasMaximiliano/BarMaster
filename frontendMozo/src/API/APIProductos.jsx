import api from '../services/axiosInstance'
import connection from '../connections/HubConnMozo'
import { construirError } from './APIError';

function normalizarDecimal(valor, fallback = undefined) {
    if (valor === undefined || valor === null || valor === '') {
        return fallback;
    }

    const numero = Number(String(valor).replace(',', '.'));
    return Number.isNaN(numero) ? fallback : numero;
}

function normalizarProducto(producto) {
    if (!producto) return producto;

    return {
        ...producto,
        // La API expone actualmente PrecioNeto/porcentajeIVA, mientras que las
        // vistas y cálculos de comandas consumen la propiedad histórica `precio`.
        precio: normalizarDecimal(
            producto.precio ?? producto.precioNeto ?? producto.Precio ?? producto.PrecioNeto,
            0
        ),
        porcentajeIVA: normalizarDecimal(
            producto.porcentajeIVA ?? producto.PorcentajeIVA,
            0
        ),
    };
}

class CrearProductoDTO {
    constructor(nombre, descripcion, precio, activo, listaIdCategorias, imagen, codigo, costoProduccion) {
        this.Codigo = codigo;
        this.Nombre = nombre;
        this.Descripcion = descripcion;
        this.Precio = precio;
        this.ListaIdCategorias = listaIdCategorias || [];
        this.CostoProduccion = costoProduccion || 0;
        this.Activo = activo;
        this.Imagen = imagen;
    }
}

export async function BuscarTodosLosProductos() {
    try {
        const response = await api.get('Productos/');
        return Array.isArray(response.data)
            ? response.data.map(normalizarProducto)
            : [];
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al buscar productos'));
    }
}

export async function BuscarUnProducto(Id) {
    try {
        const response = await api.get('Productos/' + Id);
        return normalizarProducto(response.data);
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al buscar el producto'));
    }
}

export async function CrearProducto(datos) {
    try {
        const response = await api.post(
            'Productos/',
            new CrearProductoDTO(
                datos.nombre,
                datos.descripcion,
                normalizarDecimal(datos.precio),
                true,
                datos.categorias || [], // Ya viene como array de IDs
                datos.imagen,
                datos.codigo,
                normalizarDecimal(datos.costoProduccion, 0),
            ), {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        connection.send("RecargarMenu");
        return response.data;
    } catch (error) {
        console.error("Error al crear producto:", construirError(error, 'Error al crear el producto'));
        throw construirError(error, "Error al crear el producto");
    }
}

export async function ModificarProducto(datos) {
    try {
        const modificarDTO = {
            IdProducto: datos.id,
            Codigo: datos.codigo,
            Nombre: datos.nombre,
            Descripcion: datos.descripcion,
            Precio: normalizarDecimal(datos.precio),
            CostoProduccion: normalizarDecimal(datos.costoProduccion),
            Activo: datos.activo,
            categorias: datos.categorias,
            Imagen: datos.imagen,
        };
        
        const response = await api.patch('Productos/', modificarDTO, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        connection.send("RecargarMenu");
        return response.data;
    } catch (error) {
        console.error("Error al modificar producto:", construirError(error, 'Error al modificar el producto'));
        return error.response;
    }
}

export async function ActivarProducto(Id) {
    try {
        const modificarDTO = {
            IdProducto: Id,
            Activo: true,
        };
        
        const response = await api.patch('Productos/', modificarDTO, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        connection.send("RecargarMenu");
        return response.data;
    } catch (error) {
        console.error("Error al activar producto:", construirError(error, 'Error al activar el producto'));
        return error.response;
    }
}

export async function DesactivarProducto(Id) {
    try {
        const modificarDTO = {
            IdProducto: Id,
            Activo: false,
        };
        
        const response = await api.patch('Productos/', modificarDTO, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        connection.send("RecargarMenu");
        return response.data;
    } catch (error) {
        console.error("Error al desactivar producto:", construirError(error, 'Error al desactivar el producto'));
        return error.response;
    }
}


export async function BorrarProducto(Id, Token) {
    try {
        const response = await api.delete('Productos/', {
            params: { IdProducto: Id }
        });
        connection.send("RecargarMenu");
        return response.data;
    } catch (error) {
        console.error('Error al borrar producto:', construirError(error, 'Error al eliminar el producto'));
        return error.response;
    }
}



