/* eslint-disable react-refresh/only-export-components */
import Toast_Notificacion from "../components/Toast_Notificacion";
import { Chip } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import {
    getFieldError,
    isRequiredField,
    validateFieldAndSetError,
    validateForm,
} from "../validation/formValidation";

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
            telefono: (reserva.telefono ?? reserva.Telefono ?? reserva.telefonoContacto ?? reserva.TelefonoContacto ?? '').toString().trim(),
            cantidadDePersonas: reserva.cantidadDePersonas,
            IdEstadoReserva: reserva.estado.id,
            estado: reserva.estado.nombre
        }))
    )
}

export function MappearPersonas(personas) {
    return (
        personas.map(persona => {
            const datosPersonales = persona.datosPersonales ?? persona.DatosPersonales ?? persona;
            const rol = persona.rol ?? persona.Rol ?? null;

            return {
                id: persona.id ?? persona.Id,
                nombre: datosPersonales.nombres ?? datosPersonales.Nombres ?? '',
                apellido: datosPersonales.apellido ?? datosPersonales.Apellido ?? '',
                dni: datosPersonales.dni ?? datosPersonales.Dni ?? '',
                direccion: datosPersonales.direccion ?? datosPersonales.Direccion ?? '',
                telefono: datosPersonales.telefono ?? datosPersonales.Telefono ?? '',
                email: datosPersonales.email ?? datosPersonales.Email ?? '',
                rol: rol?.id ?? rol?.Id ?? persona.idRol ?? persona.IdRol,
                rolNombre: rol?.nombre ?? rol?.Nombre ?? '',
                activo: Boolean(datosPersonales.activo ?? datosPersonales.Activo ?? persona.activo ?? persona.Activo ?? false),
            };
        })
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

export function esCampoObligatorio(campo) {
    return isRequiredField(campo);
}

export function obtenerErrorCampo(key, valor, campo = null) {
    return getFieldError(key, valor, campo);
}

export function validarFormulario(campos = [], values = {}) {
    return validateForm(campos, values);
}

export function validarCampos(key, valor, setErrors, campo = null) {
    validateFieldAndSetError(key, valor, setErrors, campo);
}
