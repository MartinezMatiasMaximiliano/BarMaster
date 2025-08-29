import Toast from 'react-bootstrap/Toast';
import { useState, useEffect } from 'react'
import { eliminar as eliminarNotificacion } from '../redux/slices/notificacionesSlice';
import { useDispatch } from 'react-redux'

function Toast_Notificacion(props) {

    const dispatch = useDispatch()

    const [show, setShow] = useState(true);

    const toggleShow = (e) => {
        dispatch(eliminarNotificacion(props.fecha));
        setShow(!show);
    }

    const [tiempo, setTiempo] = useState('');
    const [intervalo, setIntervalo] = useState(1000); // Iniciar con 1 segundo

    function tiempoTranscurrido(fechaString) {
        // Convertir la fecha en formato 'DD/MM/YYYY HH:MM:SS' a un objeto Date
        const [dia, mes, anioHora] = fechaString.split('/');
        const [anio, hora] = anioHora.split(' ');
        const [horas, minutos, segundos] = hora.split(':');

        const fechaInicial = new Date(`${anio}-${mes}-${dia}T${horas}:${minutos}:${segundos}`);
        const ahora = new Date();

        // Calcular la diferencia en segundos
        let diferenciaSegundos = Math.floor((ahora - fechaInicial) / 1000);

        // Cambiar el intervalo dependiendo del tiempo transcurrido
        if (diferenciaSegundos >= 60 && intervalo === 1000) {
            setIntervalo(60000); // Cambia el intervalo a 1 minuto
        }

        // Si la diferencia es menor a 60 segundos, devolver solo los segundos
        if (diferenciaSegundos < 60) {
            return `${diferenciaSegundos} segundos`;
        }

        // Convertir segundos a minutos
        let diferenciaMinutos = Math.floor(diferenciaSegundos / 60);

        // Cambiar el intervalo dependiendo del tiempo transcurrido
        if (diferenciaMinutos >= 60 && intervalo === 10000) {
            setIntervalo(3600000); // Cambia el intervalo a 1 hora
        }

        // Si la diferencia en minutos es menor a 60, devolver solo los minutos
        if (diferenciaMinutos < 60) {
            return `${diferenciaMinutos} minutos`;
        }

        // Convertir minutos a horas si superan los 60 minutos
        const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
        return `${diferenciaHoras} horas`;
    }

    useEffect(() => {
        var interv = setInterval(() => {
            setTiempo(tiempoTranscurrido(props.fecha))
        }, intervalo);

        // Limpiar el intervalo al desmontar el componente
        return () => clearInterval(interv);
    }, [props.fecha, intervalo]);


    return (
        <Toast className="mb-1" show={show} onClose={toggleShow}>
            <Toast.Header>
                <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                <strong className="me-auto">Mesa {props.mesa}</strong>
                <small>{tiempo}</small>
            </Toast.Header>
            <Toast.Body>{props.notificacion}</Toast.Body>
        </Toast>
    );
}

export default Toast_Notificacion;
