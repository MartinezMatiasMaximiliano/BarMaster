import { useEffect, useMemo, useState } from 'react';
import { AbrirCaja, CerrarCaja, ObtenerCajaActiva, ObtenerMovimientosCaja } from '../../../API/APICaja';
import { buildTimestampDefaults, initialApertura, initialCierre, obtenerMensajeError } from '../utils/constants';

export const useCaja = () => {
    const [cajaActiva, setCajaActiva] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [movimientosCajaActiva, setMovimientosCajaActiva] = useState([]);
    const [loadingCaja, setLoadingCaja] = useState(true);
    const [loadingMovimientos, setLoadingMovimientos] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [formApertura, setFormApertura] = useState(initialApertura);
    const [formCierre, setFormCierre] = useState(initialCierre);

    const cargarDatos = async () => {
        setLoadingCaja(true);
        setError('');
        try {
            const caja = await ObtenerCajaActiva();
            setCajaActiva(caja);
            setFormCierre((prev) => ({ ...prev, ...buildTimestampDefaults() }));
            
            // Si hay una caja activa, cargar sus movimientos para calcular el balance
            if (caja?.id) {
                // Pasar el monto inicial directamente para evitar problemas de timing con el estado
                cargarMovimientosCajaActiva(caja.id, caja.montoInicial);
            }
        } catch (err) {
            setCajaActiva(null);
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
        const cajaId = idCaja || cajaActiva?.id || cajaSeleccionada?.id;
        if (!cajaId) return;
        
        setLoadingMovimientos(true);
        setError('');
        try {
            const data = await ObtenerMovimientosCaja(cajaId);
            const cajaActual = cajaSeleccionada || cajaActiva;
            const montoInicial = montoInicialOverride ?? cajaActual?.montoInicial ?? 0;
            
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
    };

    const validarApertura = () => {
        if (!formApertura.montoInicial || Number(formApertura.montoInicial) < 0) {
            setError('El monto inicial debe ser un número positivo.');
            return false;
        }
        return true;
    };

    const validarCierre = () => {
        if (formCierre.montoFinal === '' || Number.isNaN(Number(formCierre.montoFinal))) {
            setError('Debes indicar el monto final real.');
            return false;
        }
        return true;
    };

    const onAbrirCaja = async (event) => {
        event.preventDefault();
        setMensaje('');
        setError('');

        if (!validarApertura()) {
            return;
        }

        setGuardando(true);
        try {
            // Usar siempre la fecha y hora actual al abrir la caja
            const timestampActual = buildTimestampDefaults();
            
            const payload = {
                fechaApertura: timestampActual.fecha,
                horaApertura: timestampActual.hora,
                montoInicial: Number(formApertura.montoInicial)
            };
            const caja = await AbrirCaja(payload);
            setCajaActiva(caja);
            setFormCierre(initialCierre());
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
            setFormApertura(initialApertura());
            setFormCierre(initialCierre());
            await cargarDatos();
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cerrar la caja.'));
        } finally {
            setGuardando(false);
        }
    };

    // Calcular el balance actual basado en movimientos con esEfectivo = true
    // Solo para la caja activa, usando movimientosCajaActiva (no afectado por caja seleccionada)
    const balanceActual = useMemo(() => {
        if (!cajaActiva) {
            return 0;
        }
        
        const montoInicial = cajaActiva?.montoInicial || 0;
        
        if (movimientosCajaActiva.length === 0) {
            return montoInicial;
        }
        
        // El balance es el saldo del último movimiento (más reciente) después de invertir
        // Como los movimientos ya vienen con saldo calculado, tomamos el primero (más reciente)
        const movimientoMasReciente = movimientosCajaActiva[0];
        return movimientoMasReciente?.saldo ?? montoInicial;
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

    // Actualizar fecha y hora del formulario de apertura cada minuto cuando NO hay caja activa
    useEffect(() => {
        if (cajaActiva) return;

        // Actualizar inmediatamente
        setFormApertura((prev) => ({ ...prev, ...buildTimestampDefaults() }));

        // Actualizar cada minuto
        const interval = setInterval(() => {
            setFormApertura((prev) => ({ ...prev, ...buildTimestampDefaults() }));
        }, 60000); // 60000 ms = 1 minuto

        return () => clearInterval(interval);
    }, [cajaActiva]);

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
        tabValue,
        formApertura,
        formCierre,
        diferencia,
        balanceActual,
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
        setFormApertura,
        setFormCierre
    };
};

