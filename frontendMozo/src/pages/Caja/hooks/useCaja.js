import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AbrirCaja, CerrarCaja, ObtenerCajaActiva, ObtenerMovimientosCaja } from '../../../API/APICaja';
import { buildTimestampDefaults, initialCierre, obtenerMensajeError } from '../utils/constants';
import { setCajaActiva as setCajaActivaGlobal } from '../../../redux/slices/cajaActivaSlice';
import { getMoneyFieldError } from '../../../validation/moneyValidation';

export const useCaja = () => {
    const dispatch = useDispatch();
    const visitasActivas = useSelector(state => state.visitasActivas.value);
    const [cajaActiva, setCajaActiva] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [movimientosCajaActiva, setMovimientosCajaActiva] = useState([]);
    const [loadingCaja, setLoadingCaja] = useState(true);
    const [loadingMovimientos, setLoadingMovimientos] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [tabValue, setTabValue] = useState(0);
    const [formCierre, setFormCierre] = useState(initialCierre);

    const cargarDatos = async () => {
        setLoadingCaja(true);
        setError('');
        try {
            const caja = await ObtenerCajaActiva();
            setCajaActiva(caja);
            setFormCierre((prev) => ({ ...prev, ...buildTimestampDefaults() }));
            
            // Actualizar estado global de caja activa
            dispatch(setCajaActivaGlobal(caja || null));

            // Si hay una caja activa, cargar sus movimientos para calcular el balance
            if (caja?.id) {
                // Pasar el monto inicial directamente para evitar problemas de timing con el estado
                cargarMovimientosCajaActiva(caja.id, caja.montoInicial);
            }
        } catch (err) {
            setCajaActiva(null);
            dispatch(setCajaActivaGlobal(null)); // Actualizar estado global
            setError(obtenerMensajeError(err, 'No pudimos obtener el estado de la caja.'));
        } finally {
            setLoadingCaja(false);
        }
    };

    // Función para calcular los saldos de los movimientos basado en esEfectivo y esIngreso
    const calcularSaldosMovimientos = (movimientos, montoInicial) => {
        let saldoAcumulado = montoInicial;
        
        // Ordenar movimientos por fecha y hora ascendente (más antiguos primero) para calcular saldo
        const movimientosOrdenados = [...movimientos].sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaA - fechaB;
        });
        
        // Calcular saldos
        const movimientosConSaldo = movimientosOrdenados.map(mov => {
            // Solo los movimientos con esEfectivo = true impactan en el balance
            if (mov.esEfectivo) {
                if (mov.esIngreso) {
                    saldoAcumulado += mov.monto;
                } else {
                    saldoAcumulado -= mov.monto;
                }
            }
            return { ...mov, saldo: saldoAcumulado };
        });
        
        // Invertir el orden para mostrar del más nuevo al más antiguo (como vienen del backend)
        return movimientosConSaldo.reverse();
    };

    // Función para cargar movimientos de la caja activa (para calcular balance)
    const cargarMovimientosCajaActiva = async (idCaja, montoInicialOverride = null) => {
        if (!idCaja) return;
        
        try {
            const data = await ObtenerMovimientosCaja(idCaja);
            const montoInicial = montoInicialOverride ?? cajaActiva?.montoInicial ?? 0;
            
            // Calcular saldos basados en movimientos con esEfectivo = true
            const movimientosConSaldo = calcularSaldosMovimientos(data ?? [], montoInicial);
            setMovimientosCajaActiva(movimientosConSaldo);
        } catch (err) {
            console.error('Error al cargar movimientos de caja activa:', err);
            setMovimientosCajaActiva([]);
        }
    };

    const cargarMovimientos = async (idCaja, montoInicialOverride = null) => {
        const cajaId = idCaja || cajaActiva?.id;
        if (!cajaId) return;
        
        setLoadingMovimientos(true);
        setError('');
        try {
            const data = await ObtenerMovimientosCaja(cajaId);
            const montoInicial = montoInicialOverride ?? cajaActiva?.montoInicial ?? 0;
            
            // Calcular saldos basados en movimientos con esEfectivo = true
            const movimientosConSaldo = calcularSaldosMovimientos(data ?? [], montoInicial);
            setMovimientos(movimientosConSaldo);
            
            // Si es la caja activa, también actualizar movimientosCajaActiva
            if (cajaId === cajaActiva?.id) {
                setMovimientosCajaActiva(movimientosConSaldo);
            }
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cargar los movimientos.'));
            setMovimientos([]);
        } finally {
            setLoadingMovimientos(false);
        }
    };


    const handleChange = (setter) => (event) => {
        const { name, value } = event.target;
        setter((prev) => ({ ...prev, [name]: value }));

        if (name === 'montoFinal') {
            const fieldError = value ? getMoneyFieldError(name, value) : '';

            setFieldErrors((prevErrors) => {
                const nextErrors = { ...prevErrors };

                if (fieldError) {
                    nextErrors[name] = fieldError;
                } else {
                    delete nextErrors[name];
                }

                return nextErrors;
            });
        }
    };

    const mesasAbiertas = useMemo(() => {
        return (visitasActivas || []).filter((visita) => {
            const origen = (visita.origen || visita.Origen || 'Local').toLowerCase();
            if (origen === 'delivery' || origen === 'takeaway') {
                return !visita.deliveryTakeaway?.entregado;
            }
            return visita.estado !== 'Cerrada';
        }).length;
    }, [visitasActivas]);

    const validarCierre = () => {
        if (mesasAbiertas > 0) {
            setError('No se puede cerrar caja si hay mesas abiertas, o algun delivery o takeaway activo.');
            return false;
        }

        const montoFinalError = getMoneyFieldError('montoFinal', formCierre.montoFinal);
        if (montoFinalError) {
            setFieldErrors((prevErrors) => ({ ...prevErrors, montoFinal: montoFinalError }));
            setError(montoFinalError);
            return false;
        }
        return true;
    };

    const onAbrirCaja = async (event) => {
        event.preventDefault();
        setMensaje('');
        setError('');

        setGuardando(true);
        try {
            const caja = await AbrirCaja({ montoInicial: 0 });
            setCajaActiva(caja);
            dispatch(setCajaActivaGlobal(caja || null)); // Actualizar estado global
            setFormCierre(initialCierre());
            setFieldErrors({});
            setMensaje('La caja se abrió correctamente.');
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos abrir la caja.'));
        } finally {
            setGuardando(false);
        }
    };

    const onCerrarCaja = async (event) => {
        event.preventDefault();
        setMensaje('');
        setError('');

        if (!validarCierre()) {
            return;
        }

        setGuardando(true);
        try {
            // Usar siempre la fecha y hora actual al cerrar la caja
            const timestampActual = buildTimestampDefaults();
            
            // El endpoint solo necesita el ID de la caja, no el payload completo
            await CerrarCaja(cajaActiva?.id, {
                fechaCierre: timestampActual.fecha,
                horaCierre: timestampActual.hora,
                montoFinal: Number(formCierre.montoFinal),
                observaciones: formCierre.observaciones
            });
            setMensaje('La caja se cerró correctamente.');
            setCajaActiva(null);
            dispatch(setCajaActivaGlobal(null)); // Actualizar estado global
            setFormCierre(initialCierre());
            setFieldErrors({});
            await cargarDatos();
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cerrar la caja.'));
        } finally {
            setGuardando(false);
        }
    };

    // Balance actual (efectivo): usar MontoActual del backend (fuente de verdad) para integridad de datos.
    // Fallback a cálculo por movimientos solo si el backend no envía montoActual (retrocompatibilidad).
    const balanceActual = useMemo(() => {
        if (!cajaActiva) {
            return 0;
        }
        if (typeof cajaActiva.montoActual === 'number') {
            return cajaActiva.montoActual;
        }
        const montoInicial = cajaActiva?.montoInicial || 0;
        if (movimientosCajaActiva.length === 0) {
            return montoInicial;
        }
        const movimientoMasReciente = movimientosCajaActiva[0];
        return movimientoMasReciente?.saldo ?? montoInicial;
    }, [cajaActiva, movimientosCajaActiva]);

    // Balance no efectivo: empieza en 0 al abrir la caja y suma/resta solo movimientos con esEfectivo = false.
    const balanceNoEfectivo = useMemo(() => {
        if (!cajaActiva || !movimientosCajaActiva.length) {
            return 0;
        }
        const ordenados = [...movimientosCajaActiva].sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaA - fechaB;
        });
        let saldo = 0;
        ordenados.forEach((mov) => {
            if (mov.esEfectivo === false) {
                saldo += mov.esIngreso ? (mov.monto ?? 0) : -(mov.monto ?? 0);
            }
        });
        return saldo;
    }, [cajaActiva, movimientosCajaActiva]);

    const diferencia = useMemo(() => {
        if (!cajaActiva) {
            return 0;
        }
        const esperado = balanceActual;
        const final = Number(formCierre.montoFinal || 0);
        return final - esperado;
    }, [cajaActiva, formCierre.montoFinal, balanceActual]);

    useEffect(() => {
        cargarDatos();
    }, []);

    // Actualizar fecha y hora del formulario de cierre cada minuto cuando hay caja activa
    useEffect(() => {
        if (!cajaActiva) return;

        // Actualizar inmediatamente
        setFormCierre((prev) => ({ ...prev, ...buildTimestampDefaults() }));

        // Actualizar cada minuto
        const interval = setInterval(() => {
            setFormCierre((prev) => ({ ...prev, ...buildTimestampDefaults() }));
        }, 60000); // 60000 ms = 1 minuto

        return () => clearInterval(interval);
    }, [cajaActiva]);

    useEffect(() => {
        if (tabValue === 1 && cajaActiva?.id) {
            cargarMovimientos(cajaActiva.id);
        }
    }, [cajaActiva?.id, tabValue]);

    // Mantener movimientosCajaActiva actualizados cuando cambia la caja activa
    useEffect(() => {
        if (cajaActiva?.id) {
            cargarMovimientosCajaActiva(cajaActiva.id, cajaActiva.montoInicial);
        } else {
            setMovimientosCajaActiva([]);
        }
    }, [cajaActiva?.id]);

    return {
        // Estados
        cajaActiva,
        movimientos,
        loadingCaja,
        loadingMovimientos,
        guardando,
        error,
        mensaje,
        fieldErrors,
        tabValue,
        formCierre,
        diferencia,
        balanceActual,
        balanceNoEfectivo,
        mesasAbiertas,
        // Setters
        setTabValue,
        setError,
        setMensaje,
        // Funciones
        cargarDatos,
        cargarMovimientos,
        handleChange,
        onAbrirCaja,
        onCerrarCaja,
        setFormCierre
    };
};

