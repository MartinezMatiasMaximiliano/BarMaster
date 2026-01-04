import { useState, useEffect } from 'react';
import { CrearMovimientoCaja } from '../../../API/APIMovimientosCaja';
import { ObtenerCajaActiva } from '../../../API/APICaja';
import { obtenerMensajeError } from '../../Caja/utils/constants';

const initialFormData = {
    idTipoMovimientoCaja: '',
    monto: '',
    descripcion: ''
};

export const useMovimientoCaja = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [cajaActiva, setCajaActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        cargarCajaActiva();
    }, []);

    const cargarCajaActiva = async () => {
        setLoading(true);
        setError('');
        try {
            const caja = await ObtenerCajaActiva();
            setCajaActiva(caja);
            if (!caja) {
                setError('No hay una caja abierta. Debes abrir una caja primero desde el Arqueo de Caja.');
            }
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos verificar el estado de la caja.'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        // Limpiar mensajes al cambiar campos
        if (error) setError('');
        if (mensaje) setMensaje('');
    };

    const validarFormulario = () => {
        if (!formData.idTipoMovimientoCaja) {
            setError('Debes seleccionar un tipo de movimiento.');
            return false;
        }
        if (!formData.monto || Number(formData.monto) <= 0) {
            setError('El monto debe ser mayor a 0.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMensaje('');
        setError('');

        if (!validarFormulario()) {
            return;
        }

        if (!cajaActiva) {
            setError('No hay una caja abierta. Debes abrir una caja primero.');
            return;
        }

        setGuardando(true);
        try {
            await CrearMovimientoCaja(formData);
            setMensaje('El movimiento de caja se registró correctamente.');
            // Limpiar formulario
            setFormData(initialFormData);
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos registrar el movimiento de caja.'));
        } finally {
            setGuardando(false);
        }
    };

    const limpiarMensajes = () => {
        setError('');
        setMensaje('');
    };

    return {
        // Estados
        formData,
        cajaActiva,
        loading,
        guardando,
        error,
        mensaje,
        // Funciones
        handleChange,
        handleSubmit,
        cargarCajaActiva,
        limpiarMensajes
    };
};

