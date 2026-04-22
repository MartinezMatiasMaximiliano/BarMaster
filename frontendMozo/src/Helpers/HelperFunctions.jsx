/* eslint-disable react-refresh/only-export-components */
import Toast_Notificacion from "../components/Toast_Notificacion";
import { Chip } from "@mui/material";
import Avatar from '@mui/material/Avatar';

/* Funcion para confirmar el del sistema (sirve para el sistema de una sucursal y para el panel de sucursales) */
export const handleConfirmarSalir = (loginContext, authTypeContext, setOpenConfirmDialog, navigate) => {
    // Cerrar diálogo primero
    setOpenConfirmDialog(false);
    
    // Limpiar localStorage
    localStorage.clear();
    
    // Limpiar contextos - verificar qué método está disponible
    if (loginContext?.setLogeadoEmpresaSucursal) {
        loginContext.setLogeadoEmpresaSucursal(false);
    }
    if (loginContext?.setLogeadoUsuario) {
        loginContext.setLogeadoUsuario(false);
    }
    if (authTypeContext?.setAuthType) {
        authTypeContext.setAuthType(null);
    }
    
    // Redirigir al login principal usando window.location para forzar recarga completa
    window.location.href = '/';
};

export function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // los meses van de 0 a 11
    const anio = fecha.getFullYear();

    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

// Función para formatear fecha en el formato: "Lunes 6 de Enero 16:40hs"
// Acepta:
// - Un string ISO (ej: "2024-01-06T16:40:00")
// - Un objeto Date
// - fecha y hora por separado (fecha: "2024-01-06", hora: "16:40")
export function formatearFechaCompleta(fecha, hora) {
    let fechaObj;
    
    // Si se pasan fecha y hora por separado (caso de Caja)
    if (hora !== undefined && typeof fecha === 'string' && !fecha.includes('T')) {
        fechaObj = new Date(`${fecha}T${hora || '00:00'}`);
    } 
    // Si es un string ISO o un objeto Date (caso de Reservas)
    else {
        fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    }
    
    if (!fechaObj || isNaN(fechaObj.getTime())) {
        return fecha || '';
    }
    
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const diaSemana = diasSemana[fechaObj.getDay()];
    const dia = fechaObj.getDate();
    const mes = meses[fechaObj.getMonth()];
    
    // Si se pasó hora por separado, usarla; sino extraer de fechaObj
    let horaFormateada;
    if (hora !== undefined && typeof fecha === 'string' && !fecha.includes('T')) {
        horaFormateada = hora || '00:00';
    } else {
        const horas = String(fechaObj.getHours()).padStart(2, '0');
        const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
        horaFormateada = `${horas}:${minutos}`;
    }
    
    return `${diaSemana} ${dia} de ${mes} ${horaFormateada}hs`;
}

export function formatearHoraCompleta(fecha) {
    return fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function GetChipNombreCompleto(Nombre, Apellido) {
    const nombres = Nombre || localStorage.getItem('USER_nombres') || '';
    const apellido = Apellido || localStorage.getItem('USER_apellido') || '';
 
    const ChipNombreCompleto =
        <Chip
            avatar={<Avatar>{nombres?.[0]?.toUpperCase() || ''}</Avatar>}
            label={`${nombres} ${apellido}`}
            variant="outlined"
            color="success"
        />;

    return ChipNombreCompleto;
}

export function MappearPedidos(visitas) {
    return visitas.flatMap(visita => {
        const productos = visita.productosConsumidos || [];
        return productos.map(producto => ({
            fecha: visita.fechaHora,
            indicaciones: producto.indicaciones,
            mesa: visita.numeroMesa,
            precio: producto.precio,
            nombre: producto.nombre
        }));
    });
}

export function MappearReservas(reservas) {
    return (
        reservas.map(reserva => ({
            id: reserva.id,
            fechaHora: reserva.fechaHora,
            nombreReserva: reserva.nombreReserva,
            cantidadDePersonas: reserva.cantidadDePersonas,
            IdEstadoReserva: reserva.estado.id,
            estado: reserva.estado.nombre
        }))
    )
}

export function MappearPersonas(personas) {
    return (
        personas.map(persona => ({
            id: persona.id,
            nombre: persona.nombres,
            apellido: persona.apellido,
            dni: persona.dni,
            direccion: persona.direccion,
            telefono: persona.telefono,
            email: persona.email,
            rol: persona.rol?.id || persona.idRol,
            rolNombre: persona.rol?.nombre || '',
            activo: persona.activo
        }))
    )
}

export function MappearMozos(mozos) {
    return (
        mozos.map(mozo => ({
            id: mozo.id,
            codigoDeServicio: mozo.codigoDeServicio,
            idRol: mozo.rol?.id,
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
            codigo: item.codigo,
            nombre: item.nombre,
            precio: item.precio,
            costoProduccion: item.costo,
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
            numero: mesa.nombre || mesa.numeroMesa || "", 
            codigoParaPedir: mesa.codigoParaPedir,
            capacidad: mesa.capacidad || 0,
            idPlano: mesa.plano?.id || mesa.idPlano || null,
            nombrePlano: mesa.plano?.nombre || mesa.nombrePlano || null,
        }))
    )
}

export function MappearPlanos(planos) {
    return (
        planos.map(plano => ({
            id: plano.id,
            nombre: plano.nombre,
            detalles: plano.detalles,
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
    decimal: /^[0-9]+(?:,[0-9]+)?$/,
    image: /image/i,
    int4: /^[0-9]{4}$/, // int de 4 digitos
    texto: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s°$.!¿?*[\],#-]*$/, // Permite letras, números, espacios y los caracteres  
};

const tipoColumnas = {
    string: ['nombre', 'apellido'],
    int: ['numero', 'telefono', 'dni', 'cantidaddepersonas', 'mesa', 'capacidad'],
    decimal: ['precio', 'costoproduccion'],
    image: ['imagen'],
    int4: ['codigodeservicio'], 
    texto: ["direccion", "descripcion", "nombrereserva"]
};

const camposObligatorios = ['nombre', 'descripcion', 'precio', 'rol', 'categorias', 'apellido', 'dni', 'numero', 'capacidad', 'fechahora', 'nombrereserva', 'cantidaddepersonas', 'mesa', 'estado']

function esValorVacio(valor) {
    if (valor === null || valor === undefined) return true;
    if (typeof valor === "string") return valor.trim().length === 0;
    if (Array.isArray(valor)) return valor.length === 0;
    return false;
}

export function esCampoObligatorio(campo) {
    if (!campo) return false;
    if (typeof campo === "string") {
        return camposObligatorios.includes(campo.toLowerCase());
    }

    return Boolean(campo.required) || camposObligatorios.includes(campo.name?.toLowerCase());
}

export function obtenerErrorCampo(key, valor, campo = null) {
    const keyNormalizada = key.toLowerCase();

    if (esCampoObligatorio(campo ?? key) && esValorVacio(valor)) {
        return "Este campo es obligatorio.";
    }

    if (esValorVacio(valor)) {
        return null;
    }

    if (tipoColumnas.string.includes(keyNormalizada) && !regex.string.test(valor)) {
        return "Formato invalido. Solo se permiten letras, espacios y signos de puntuacion.";
    }

    if (tipoColumnas.int.includes(keyNormalizada) && !regex.int.test(String(valor))) {
        return "Formato invalido. Solo se permiten numeros.";
    }

    if (tipoColumnas.decimal.includes(keyNormalizada) && !regex.decimal.test(String(valor))) {
        return "Formato invalido. Solo se permiten numeros y una coma decimal.";
    }

    if (tipoColumnas.image.includes(keyNormalizada) && !regex.image.test(valor?.type || "")) {
        return "Solo se permite subir imagenes.";
    }

    if (tipoColumnas.int4.includes(keyNormalizada) && !regex.int4.test(String(valor))) {
        return "Formato invalido. Se permiten unicamente 4 numeros.";
    }

    if (tipoColumnas.texto.includes(keyNormalizada) && !regex.texto.test(valor)) {
        return "Formato invalido. Se permiten letras y numeros";
    }

    return null;
}

export function validarFormulario(campos = [], values = {}) {
    const errores = {};

    campos.forEach((campo) => {
        const error = obtenerErrorCampo(campo.name, values[campo.name], campo);
        if (error) {
            errores[campo.name] = error;
        }
    });

    return errores;
}

export function validarCampos(key, valor, setErrors, campo = null) {
    const error = obtenerErrorCampo(key, valor, campo);

    setErrors(prevErrors => {
        const newErrors = { ...prevErrors };

        if (error) {
            newErrors[key] = error;
        } else {
            delete newErrors[key];
        }

        return newErrors;
    });
}
