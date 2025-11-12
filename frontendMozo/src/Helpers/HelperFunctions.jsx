/* eslint-disable react-refresh/only-export-components */
import Toast_Notificacion from "../components/Toast_Notificacion";
import { Chip } from "@mui/material";
import Avatar from '@mui/material/Avatar';

export function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // los meses van de 0 a 11
    const anio = fecha.getFullYear();

    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

export function GetChipNombreCompleto(Nombre, Apellido) {
    const nombres = Nombre || localStorage.getItem('nombres') || '';
    const apellido = Apellido || localStorage.getItem('apellido') || '';

    const ChipNombreCompleto =
        <Chip
            avatar={<Avatar>{nombres?.[0]?.toUpperCase() || ''}</Avatar>}
            label={`${nombres} ${apellido}`}
            variant="outlined"
            color="success"
        />;

    return ChipNombreCompleto;
}

export function MappearPedidos(pedidos) {
    return pedidos.flatMap(pedido =>
        pedido.items.map(item => ({
            fecha: pedido.fechaRealizado,
            indicaciones: item.indicaciones,
            mesa: pedido.numeroMesa,
            precio: item.precio,
            nombre: item.nombre
        }))
    );
}

export function MappearPersonas(personas) {
    return (
        personas.map(persona => ({
            id: persona.id,
            nombre: persona.datosPersonales.nombres,
            apellido: persona.datosPersonales.apellido,
            dni: persona.datosPersonales.dni,
            direccion: persona.datosPersonales.direccion,
            telefono: persona.datosPersonales.telefono,
            rol: persona.rol.id,
            rolNombre: persona.rol.nombre,
            activo: persona.datosPersonales.activo
        }))
    )
}

export function MappearMozos(mozos) {
    return (
        mozos.map(mozo => ({
        id: mozo.id,
        codigoDeServicio: mozo.codigoDeServicio,
        nombre: mozo.datosPersonales.nombres,
        apellido: mozo.datosPersonales.apellido,
        dni: mozo.datosPersonales.dni,
        direccion: mozo.datosPersonales.direccion,
        telefono: mozo.datosPersonales.telefono,
        activo: mozo.datosPersonales.activo
        }))
    )
}

export function MappearCategorias(categorias) {
    return (
        categorias.map(cat => ({
            id: cat.id,
            nombre: cat.nombre,
            activo: cat.activo,
        }))
    )
}

export function MappearMenu(menu) {
    return (
        menu.map(item => ({
            imagen: item.imagenUrl,
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            descripcion: item.descripcion,
            categorias: item.categorias,
            activo: item.activo,
        }))
    )
}

export function MappearMesas(mesas) {
    return (
        mesas.map(mesa => ({
        id: mesa.id,
        numeroMesa: mesa.numeroMesa, 
        codigoParaPedir: mesa.codigoParaPedir,
        nombreMozo: mesa.persona == null ? "Sin Mozo" : mesa.persona.nombres + ' ' + mesa.persona.apellido,
        idMozo: mesa.persona == null ? '' : mesa.persona.id,
        }))
    )
}

export function MappearNotificaciones(notificaciones, eliminarNotificacion) {
    return (
        notificaciones.map((notif, i) =>
            <Toast_Notificacion key={i} mesa={notif.idMesa} fecha={notif.fecha} notificacion={notif.mensaje} eliminarNotificacion={eliminarNotificacion}></Toast_Notificacion>)
    )
}

const regex = {
    string: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,:;!?]*$/,
    int: /^[0-9]*$/,
    image: /image/i,
    int4: /^[0-9]{4}$/, // int de 4 digitos
    texto: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s°.,#-]*$/, // Permite letras, números, espacios y los caracteres ° . , # -
};

const tipoColumnas = {
    string: ['nombre', 'apellido'],
    int: ['precio', 'número de mesa', 'teléfono', 'dni'],
    image: ['imagen'],
    int4: ['codigodeservicio'], 
    texto: ["dirección", "descripción"]
};

const camposObligatorios = ['nombre', 'descripcion', 'precio', 'rol', 'categorias', 'apellido', 'dni', 'numero de mesa']

export function validarCampos(key, valor, setErrors) {
    if (camposObligatorios.includes(key.toLowerCase())) {
        if (!valor || valor.length === 0) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [key]: "Este campo es obligatorio."
            }));
        } else {
            // Limpiar el error si el valor es válido
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[key];
                return newErrors;
            });
        }
        
    }
    if (tipoColumnas.string.includes(key.toLowerCase())) {
        if (!regex.string.test(valor)) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [key]: "Formato invalido. Solo se permiten letras, espacios y signos de puntuacion."
            }));
        } else {
            // Limpiar el error si el valor es válido
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[key];
                return newErrors;
            });
        }
    } else if (tipoColumnas.int.includes(key.toLowerCase())) {
        if (!regex.int.test(valor)) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [key]: "Formato invalido. Solo se permiten numeros."
            }));
        } else {
            // Limpiar el error si el valor es válido
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[key];
                return newErrors;
            });
        }
    } else if (tipoColumnas.image.includes(key.toLowerCase())) {
        if (!regex.image.test(valor.type)) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [key]: "Solo se permite subir imagenes."
            }));
        } else {
            // Limpiar el error si el valor es válido
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[key];
                return newErrors;
            });
        }
    } else if (tipoColumnas.int4.includes(key.toLowerCase())) {
        if (!regex.int4.test(valor)) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [key]: "Formato invalido. Se permiten unicamente 4 numeros."
            }));
        } else {
            // Limpiar el error si el valor es válido
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[key];
                return newErrors;
            });
        }
    } else if (tipoColumnas.texto.includes(key.toLowerCase())) {
        if (!regex.texto.test(valor)) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [key]: "Formato invalido. Se permiten letras y numeros"
            }));
        } else {
            // Limpiar el error si el valor es válido
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[key];
                return newErrors;
            });
        }
    }
}
