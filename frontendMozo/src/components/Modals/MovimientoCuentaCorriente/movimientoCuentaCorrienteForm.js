import { getPositiveMoneyFieldError } from '../../../validation/moneyValidation';

export const INITIAL_FORM_DATA = {
    idTipoMovimientoCaja: '',
    valorMovimiento: '',
    montoAbonado: '',
    descripcion: ''
};

const MENSAJE_MONTO_INSUFICIENTE = 'El monto abonado no puede ser menor al valor del movimiento.';

export function buscarTipoMovimiento(tiposMovimiento, idTipoMovimientoCaja) {
    return tiposMovimiento.find((tipo) => tipo.id === Number(idTipoMovimientoCaja));
}

export function obtenerMontoAbonadoEfectivo(formData, tipoMovimiento) {
    if (!tipoMovimiento?.esEfectivo) {
        return formData.valorMovimiento;
    }

    return formData.montoAbonado || formData.valorMovimiento;
}

export function calcularVuelto(formData) {
    if (formData.valorMovimiento === '' || formData.montoAbonado === '') {
        return null;
    }

    const valorMovimiento = Number(formData.valorMovimiento);
    const montoAbonado = Number(formData.montoAbonado);

    if (!Number.isFinite(valorMovimiento) || !Number.isFinite(montoAbonado)) {
        return null;
    }

    return montoAbonado - valorMovimiento;
}

export function validarMovimiento({
    formData,
    tipoMovimiento,
    balanceActual,
    validarRequeridos = false
}) {
    const errors = {
        valorMovimiento: '',
        montoAbonado: ''
    };

    if (formData.valorMovimiento || validarRequeridos) {
        errors.valorMovimiento = getPositiveMoneyFieldError(
            'valorMovimiento',
            formData.valorMovimiento
        ) || '';
    }

    const esEgresoEfectivo = tipoMovimiento?.esEfectivo && !tipoMovimiento?.esIngreso;
    if (!errors.valorMovimiento
        && esEgresoEfectivo
        && Number(formData.valorMovimiento) > balanceActual) {
        errors.valorMovimiento = `El valor no puede ser mayor al balance actual de ${balanceActual.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`;
    }

    if (tipoMovimiento?.esEfectivo) {
        const montoAbonado = obtenerMontoAbonadoEfectivo(formData, tipoMovimiento);

        if (montoAbonado || validarRequeridos) {
            errors.montoAbonado = getPositiveMoneyFieldError(
                'montoAbonado',
                montoAbonado
            ) || '';
        }

        if (!errors.montoAbonado
            && Number(montoAbonado) < Number(formData.valorMovimiento)) {
            errors.montoAbonado = MENSAJE_MONTO_INSUFICIENTE;
        }
    }

    return errors;
}

export function prepararMovimiento(formData, tipoMovimiento) {
    return {
        idTipoMovimientoCaja: Number(formData.idTipoMovimientoCaja),
        valorMovimiento: Number(formData.valorMovimiento),
        montoAbonado: Number(obtenerMontoAbonadoEfectivo(formData, tipoMovimiento)),
        descripcion: formData.descripcion.trim()
    };
}
