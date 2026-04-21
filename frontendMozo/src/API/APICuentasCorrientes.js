import api from '../services/axiosInstance';
import { ObtenerCajaActiva } from './APICaja';
import { construirError } from './APIError';

function normalizarMovimiento(movimiento) {
    return {
        idMovimientoCaja: movimiento.idMovimimientoCaja ?? movimiento.IdMovimimientoCaja ?? null,
        descripcion: (movimiento.descripcion ?? movimiento.Descripcion ?? '').toString().trim(),
        monto: Number(movimiento.monto ?? movimiento.Monto ?? 0),
        fechaMovimiento: movimiento.fechaMovimiento ?? movimiento.FechaMovimiento ?? null,
        esIngreso: movimiento.esIngreso ?? movimiento.EsIngreso ?? false,
        esEfectivo: movimiento.esEfectivo ?? movimiento.EsEfectivo ?? false,
    };
}

function normalizarCuentaCorriente(cuenta) {
    const movimientosRaw = cuenta.movimientos ?? cuenta.Movimientos ?? [];
    const movimientos = Array.isArray(movimientosRaw) ? movimientosRaw.map(normalizarMovimiento) : [];

    return {
        id: cuenta.id ?? cuenta.Id,
        nombre: (cuenta.nombre ?? cuenta.Nombre ?? '').toString().trim(),
        telefono: (cuenta.telefono ?? cuenta.Telefono ?? '').toString().trim(),
        domicilio: (cuenta.domicilio ?? cuenta.Domicilio ?? '').toString().trim(),
        balance: Number(cuenta.balance ?? cuenta.Balance ?? 0),
        descuento: Number(cuenta.descuento ?? cuenta.Descuento ?? 0),
        movimientos,
    };
}

export async function BuscarTodasLasCuentasCorrientes() {
    try {
        const response = await api.get('CuentasCorrientes');
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(normalizarCuentaCorriente);
    } catch (error) {
        throw construirError(error, 'Error al obtener las cuentas corrientes');
    }
}

export async function BuscarCuentaCorrientePorId(id) {
    try {
        const response = await api.get(`CuentasCorrientes/${id}`);
        return normalizarCuentaCorriente(response.data ?? {});
    } catch (error) {
        throw construirError(error, 'Error al obtener la cuenta corriente');
    }
}

export async function CrearCuentaCorriente(datos) {
    try {
        const payload = {
            Nombre: datos.nombre?.trim() || '',
            Telefono: datos.telefono?.trim() || '',
            Domicilio: datos.domicilio?.trim() || '',
        };

        const response = await api.post('CuentasCorrientes/Crear', payload);
        return normalizarCuentaCorriente(response.data ?? {});
    } catch (error) {
        throw construirError(error, 'Error al crear la cuenta corriente');
    }
}

export async function ModificarCuentaCorriente(datos) {
    try {
        const payload = {
            IdCuenta: datos.id,
        };

        if (datos.nombre !== undefined) {
            payload.Nombre = datos.nombre?.trim() || '';
        }
        if (datos.telefono !== undefined) {
            payload.Telefono = datos.telefono?.trim() || '';
        }
        if (datos.domicilio !== undefined) {
            payload.Domicilio = datos.domicilio?.trim() || '';
        }
        if (datos.descuento !== undefined && datos.descuento !== '') {
            payload.Descuento = Number(datos.descuento);
        }

        const response = await api.post('CuentasCorrientes/Modificar', payload);
        return normalizarCuentaCorriente(response.data ?? {});
    } catch (error) {
        throw construirError(error, 'Error al modificar la cuenta corriente');
    }
}

export async function EliminarCuentaCorriente(id) {
    try {
        const response = await api.delete('CuentasCorrientes', {
            params: { IdCuenta: id },
        });
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al eliminar la cuenta corriente');
    }
}

export async function CrearMovimientoCuentaCorriente(idCuenta, datos) {
    try {
        const cajaActiva = await ObtenerCajaActiva();

        if (!cajaActiva?.id) {
            throw new Error('No hay una caja abierta. Debes abrir una caja primero.');
        }

        const payload = {
            idTipoMovimientoCaja: Number(datos.idTipoMovimientoCaja),
            idCaja: cajaActiva.id,
            monto: Number(datos.monto),
            descripcion: datos.descripcion || '',
        };

        const response = await api.post('CuentasCorrientes/CrearMovimiento', payload, {
            params: { IdCuenta: idCuenta },
        });

        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al crear el movimiento de la cuenta corriente');
    }
}

