import { useEffect, useMemo, useState } from 'react';
import { ObtenerCajaActiva } from '../../../API/APICaja';
import { CrearMovimientoCuentaCorriente } from '../../../API/APICuentasCorrientes';
import { ObtenerTiposMovimientoCaja } from '../../../API/APIMovimientosCaja';
import { obtenerMensajeError } from '../../../pages/Caja/utils/constants';
import {
    buscarTipoMovimiento,
    INITIAL_FORM_DATA,
    prepararMovimiento,
    validarMovimiento
} from './movimientoCuentaCorrienteForm';

const INITIAL_ERRORS = {
    general: '',
    valorMovimiento: '',
    montoAbonado: ''
};

export function useMovimientoCuentaCorriente({ open, cuentaCorriente, onSuccess, onClose }) {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [cajaActiva, setCajaActiva] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const tipoSeleccionado = useMemo(
        () => buscarTipoMovimiento(tiposMovimiento, formData.idTipoMovimientoCaja),
        [tiposMovimiento, formData.idTipoMovimientoCaja]
    );
    const balanceActual = cajaActiva?.montoActual ?? 0;
    const esEgresoEfectivo = tipoSeleccionado?.esEfectivo && !tipoSeleccionado?.esIngreso;

    useEffect(() => {
        if (!open) {
            setFormData(INITIAL_FORM_DATA);
            setErrors(INITIAL_ERRORS);
            return undefined;
        }

        let activo = true;
        setLoading(true);
        setErrors(INITIAL_ERRORS);
        setTiposMovimiento([]);
        setCajaActiva(null);

        Promise.all([
            ObtenerTiposMovimientoCaja('CuentaCorriente'),
            ObtenerCajaActiva()
        ])
            .then(([tipos, caja]) => {
                if (!activo) return;

                setTiposMovimiento(Array.isArray(tipos) ? tipos : []);
                setCajaActiva(caja);
                if (!caja) {
                    setErrors((prev) => ({
                        ...prev,
                        general: 'No hay una caja abierta. Debes abrir una caja primero desde el Arqueo de Caja.'
                    }));
                }
            })
            .catch((error) => {
                if (!activo) return;
                setErrors((prev) => ({
                    ...prev,
                    general: obtenerMensajeError(error, 'No pudimos cargar los datos para registrar el movimiento.')
                }));
            })
            .finally(() => {
                if (activo) setLoading(false);
            });

        return () => {
            activo = false;
        };
    }, [open]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const siguienteFormData = { ...formData, [name]: value };
        const siguienteTipo = buscarTipoMovimiento(
            tiposMovimiento,
            siguienteFormData.idTipoMovimientoCaja
        );

        setFormData(siguienteFormData);
        setErrors({
            general: '',
            ...validarMovimiento({
                formData: siguienteFormData,
                tipoMovimiento: siguienteTipo,
                balanceActual
            })
        });
    };

    const validacionCompleta = validarMovimiento({
        formData,
        tipoMovimiento: tipoSeleccionado,
        balanceActual,
        validarRequeridos: true
    });
    const puedeGuardar = !!cajaActiva?.id
        && !!tipoSeleccionado
        && !validacionCompleta.valorMovimiento
        && !validacionCompleta.montoAbonado;

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!tipoSeleccionado) {
            setErrors((prev) => ({ ...prev, general: 'Debes seleccionar un tipo de movimiento.' }));
            return;
        }

        const fieldErrors = validarMovimiento({
            formData,
            tipoMovimiento: tipoSeleccionado,
            balanceActual,
            validarRequeridos: true
        });
        const primerError = fieldErrors.valorMovimiento || fieldErrors.montoAbonado;
        if (primerError) {
            setErrors({ general: primerError, ...fieldErrors });
            return;
        }

        if (!cajaActiva?.id) {
            setErrors((prev) => ({
                ...prev,
                general: 'No hay una caja abierta. Debes abrir una caja primero.'
            }));
            return;
        }

        setGuardando(true);
        setErrors((prev) => ({ ...prev, general: '' }));
        try {
            await CrearMovimientoCuentaCorriente(
                cuentaCorriente.id,
                prepararMovimiento(formData, tipoSeleccionado)
            );
            await onSuccess?.();
            onClose();
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                general: obtenerMensajeError(error, 'No pudimos registrar el movimiento de la cuenta corriente.')
            }));
        } finally {
            setGuardando(false);
        }
    };

    return {
        formData,
        errors,
        tiposMovimiento,
        tipoSeleccionado,
        balanceActual,
        esEgresoEfectivo,
        hayCajaActiva: !!cajaActiva?.id,
        loading,
        guardando,
        puedeGuardar,
        handleChange,
        handleSubmit
    };
}
