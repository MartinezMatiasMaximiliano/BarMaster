import { useEffect, useMemo, useState } from 'react';
import { AbrirCaja, CerrarCaja, ObtenerCajaActiva, ObtenerHistorialCaja, ObtenerMovimientosCaja } from '../../../API/APICaja';
import { buildTimestampDefaults, initialApertura, initialCierre, obtenerMensajeError } from '../utils/constants';

export const useCaja = () => {
    const [cajaActiva, setCajaActiva] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
    const [loadingCaja, setLoadingCaja] = useState(true);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
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
            const [caja, itemsHistorial] = await Promise.allSettled([
                ObtenerCajaActiva(),
                ObtenerHistorialCaja({ limite: 5 })
            ]);

            if (caja.status === 'fulfilled') {
                setCajaActiva(caja.value ?? null);
                setFormCierre((prev) => ({ ...prev, ...buildTimestampDefaults() }));
            } else {
                throw caja.reason;
            }

            if (itemsHistorial.status === 'fulfilled') {
                setHistorial(itemsHistorial.value ?? []);
            }
        } catch (err) {
            setCajaActiva(null);
            setError(obtenerMensajeError(err, 'No pudimos obtener el estado de la caja.'));
        } finally {
            setLoadingCaja(false);
        }
    };

    const cargarMovimientos = async (idCaja) => {
        const cajaId = idCaja || cajaActiva?.id || cajaSeleccionada?.id;
        if (!cajaId) return;
        
        setLoadingMovimientos(true);
        setError('');
        try {
            const data = await ObtenerMovimientosCaja(cajaId);
            setMovimientos(data ?? []);
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cargar los movimientos.'));
            setMovimientos([]);
        } finally {
            setLoadingMovimientos(false);
        }
    };

    const handleClickArqueo = (arqueo) => {
        if (cajaSeleccionada?.id === arqueo.id) {
            setCajaSeleccionada(null);
            if (cajaActiva?.id) {
                setTabValue(1);
                cargarMovimientos(cajaActiva.id);
            } else {
                setTabValue(0);
            }
        } else {
            setCajaSeleccionada(arqueo);
            setTabValue(1);
        }
    };

    const handleChange = (setter) => (event) => {
        const { name, value } = event.target;
        setter((prev) => ({ ...prev, [name]: value }));
    };

    const validarApertura = () => {
        if (!formApertura.fecha || !formApertura.hora) {
            setError('La fecha y hora de apertura son obligatorias.');
            return false;
        }
        if (!formApertura.montoInicial || Number(formApertura.montoInicial) < 0) {
            setError('El monto inicial debe ser un número positivo.');
            return false;
        }
        return true;
    };

    const validarCierre = () => {
        if (!formCierre.fecha || !formCierre.hora) {
            setError('La fecha y hora de cierre son obligatorias.');
            return false;
        }
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
            const payload = {
                fechaApertura: formApertura.fecha,
                horaApertura: formApertura.hora,
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
            const payload = {
                fechaCierre: formCierre.fecha,
                horaCierre: formCierre.hora,
                montoFinal: Number(formCierre.montoFinal),
                observaciones: formCierre.observaciones
            };
            await CerrarCaja(cajaActiva?.id, payload);
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

    const diferencia = useMemo(() => {
        if (!cajaActiva) {
            return 0;
        }
        const esperado =
            Number(cajaActiva?.montoEsperado ?? cajaActiva?.totalEsperado ?? cajaActiva?.montoInicial ?? 0);
        const final = Number(formCierre.montoFinal || 0);
        return final - esperado;
    }, [cajaActiva, formCierre.montoFinal]);

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (tabValue === 1) {
            if (cajaSeleccionada?.id) {
                cargarMovimientos(cajaSeleccionada.id);
            } else if (cajaActiva?.id) {
                cargarMovimientos(cajaActiva.id);
            }
        } else if (tabValue === 0) {
            if (!cajaActiva && cajaSeleccionada) {
                setCajaSeleccionada(null);
            }
        }
    }, [cajaActiva?.id, cajaSeleccionada?.id, tabValue]);

    return {
        // Estados
        cajaActiva,
        historial,
        movimientos,
        cajaSeleccionada,
        loadingCaja,
        loadingHistorial,
        loadingMovimientos,
        guardando,
        error,
        mensaje,
        tabValue,
        formApertura,
        formCierre,
        diferencia,
        // Setters
        setCajaSeleccionada,
        setTabValue,
        setError,
        setMensaje,
        setLoadingHistorial,
        setHistorial,
        // Funciones
        cargarDatos,
        cargarMovimientos,
        handleClickArqueo,
        handleChange,
        onAbrirCaja,
        onCerrarCaja,
        setFormApertura,
        setFormCierre
    };
};

