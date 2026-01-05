import { useState } from 'react';
import { ObtenerMovimientosCaja } from '../../../API/APICaja';
import { obtenerMensajeError } from '../utils/constants';

export const useCajaHistorial = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [loadingMovimientos, setLoadingMovimientos] = useState(false);
    const [error, setError] = useState('');

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

    const cargarMovimientos = async (idCaja, montoInicial = null) => {
        if (!idCaja) return;
        
        setLoadingMovimientos(true);
        setError('');
        try {
            const data = await ObtenerMovimientosCaja(idCaja);
            // Si no se proporciona montoInicial, intentar obtenerlo de la caja seleccionada
            // Por ahora usamos 0 si no se proporciona
            const montoInicialCalculado = montoInicial ?? 0;
            
            // Calcular saldos basados en movimientos con esEfectivo = true
            const movimientosConSaldo = calcularSaldosMovimientos(data ?? [], montoInicialCalculado);
            setMovimientos(movimientosConSaldo);
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cargar los movimientos.'));
            setMovimientos([]);
        } finally {
            setLoadingMovimientos(false);
        }
    };

    return {
        movimientos,
        loadingMovimientos,
        error,
        cargarMovimientos
    };
};

