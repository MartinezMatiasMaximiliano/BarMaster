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

export function MappearPedidos(visitas) {
    return visitas.flatMap(visita => {
        const productos = visita.productos || [];
        return productos.map(producto => ({
            fecha: visita.fechaHora || visita.fechaRealizado,
            indicaciones: producto.indicaciones,
            mesa: visita.mesa?.numero || visita.numeroMesa,
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
            numero: mesa.nombre || mesa.numeroMesa || "", 
            codigoParaPedir: mesa.codigoParaPedir,
            nombreMozo: mesa.persona == null ? "Sin Mozo" : mesa.persona.nombres + ' ' + mesa.persona.apellido,
            idMozo: mesa.persona == null ? '' : mesa.persona.id,
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
    image: /image/i,
    int4: /^[0-9]{4}$/, // int de 4 digitos
    texto: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s°$.!¿?*[\],#-]*$/, // Permite letras, números, espacios y los caracteres  
};

const tipoColumnas = {
    string: ['nombre', 'apellido'],
    int: ['precio', 'numero', 'telefono', 'dni', 'cantidaddepersonas', 'mesa'],
    image: ['imagen'],
    int4: ['codigodeservicio'], 
    texto: ["direccion", "descripcion", "nombrereserva"]
};

const camposObligatorios = ['nombre', 'descripcion', 'precio', 'rol', 'categorias', 'apellido', 'dni', 'numero', 'fechahora', 'nombrereserva', 'cantidaddepersonas', 'mesa', 'estado']

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
