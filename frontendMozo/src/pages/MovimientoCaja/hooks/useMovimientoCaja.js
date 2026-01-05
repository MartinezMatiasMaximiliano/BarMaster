import { useState, useEffect, useMemo } from 'react';
import { CrearMovimientoCaja, ObtenerTiposMovimientoCaja } from '../../../API/APIMovimientosCaja';
import { ObtenerCajaActiva, ObtenerMovimientosCaja } from '../../../API/APICaja';
import { obtenerMensajeError } from '../../Caja/utils/constants';

const initialFormData = {
    idTipoMovimientoCaja: '',
    monto: '',
    descripcion: ''
};

export const useMovimientoCaja = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [cajaActiva, setCajaActiva] = useState(null);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [movimientosCajaActiva, setMovimientosCajaActiva] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [errorMonto, setErrorMonto] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para calcular el balance actual de la caja
    const calcularBalanceActual = (movimientos, montoInicial) => {
        let saldoAcumulado = montoInicial || 0;
        
        // Ordenar movimientos por fecha y hora ascendente (más antiguos primero)
        const movimientosOrdenados = [...movimientos].sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaA - fechaB;
        });
        
        // Calcular saldo acumulado
        movimientosOrdenados.forEach(mov => {
            if (mov.esEfectivo) {
                if (mov.esIngreso) {
                    saldoAcumulado += mov.monto;
                } else {
                    saldoAcumulado -= mov.monto;
                }
            }
        });
        
        return saldoAcumulado;
    };

    const cargarMovimientosCaja = async (idCaja, montoInicial) => {
        if (!idCaja) return;
        try {
            const movimientos = await ObtenerMovimientosCaja(idCaja);
            setMovimientosCajaActiva(movimientos || []);
        } catch (err) {
            console.error('Error al cargar movimientos de caja:', err);
            setMovimientosCajaActiva([]);
        }
    };

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [caja, tipos] = await Promise.all([
                ObtenerCajaActiva(),
                ObtenerTiposMovimientoCaja()
            ]);
            
            setCajaActiva(caja);
            setTiposMovimiento(tipos);
            
            if (!caja) {
                setError('No hay una caja abierta. Debes abrir una caja primero desde el Arqueo de Caja.');
            } else if (caja.id) {
                // Cargar movimientos para calcular el balance actual
                await cargarMovimientosCaja(caja.id, caja.montoInicial);
            }
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cargar los datos.'));
        } finally {
            setLoading(false);
        }
    };

    // Calcular balance actual
    const balanceActual = useMemo(() => {
        if (!cajaActiva) return 0;
        const montoInicial = cajaActiva.montoInicial || 0;
        return calcularBalanceActual(movimientosCajaActiva, montoInicial);
    }, [cajaActiva, movimientosCajaActiva]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const nuevoFormData = {
            ...formData,
            [name]: value
        };
        setFormData(nuevoFormData);
        
        // Limpiar mensajes al cambiar campos
        if (error) setError('');
        if (mensaje) setMensaje('');
        if (errorMonto) setErrorMonto('');

        // Validar monto en tiempo real si es un egreso
        // Validar tanto cuando cambia el monto como cuando cambia el tipo de movimiento
        if ((name === 'monto' || name === 'idTipoMovimientoCaja') && nuevoFormData.monto) {
            const tipoSeleccionado = tiposMovimiento.find(
                (t) => t.id === Number(nuevoFormData.idTipoMovimientoCaja)
            );
            if (tipoSeleccionado && tipoSeleccionado.esEfectivo && !tipoSeleccionado.esIngreso) {
                const monto = Number(nuevoFormData.monto);
                if (monto > balanceActual) {
                    setErrorMonto(`El monto no puede ser mayor al balance actual de ${balanceActual.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`);
                }
            }
        }
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

        // Validar que los egresos no excedan el balance actual
        const tipoSeleccionado = tiposMovimiento.find(
            (t) => t.id === Number(formData.idTipoMovimientoCaja)
        );
        
        if (tipoSeleccionado && tipoSeleccionado.esEfectivo && !tipoSeleccionado.esIngreso) {
            const monto = Number(formData.monto);
            if (monto > balanceActual) {
                setError(`No puedes registrar un egreso mayor al balance actual de la caja (${balanceActual.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}).`);
                setErrorMonto(`El monto no puede ser mayor al balance actual de ${balanceActual.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`);
                return false;
            }
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
            // Recargar movimientos para actualizar el balance
            if (cajaActiva?.id) {
                await cargarMovimientosCaja(cajaActiva.id, cajaActiva.montoInicial);
            }
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
        tiposMovimiento,
        loading,
        guardando,
        error,
        mensaje,
        errorMonto,
        balanceActual,
        // Funciones
        handleChange,
        handleSubmit,
        cargarDatos,
        limpiarMensajes
    };
};

