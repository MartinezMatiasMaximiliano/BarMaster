import { useCallback, useEffect, useMemo, useState } from 'react';
import { BuscarTodosLosProductos } from '../../../API/APIProductos';
import { BuscarStock, ConfigurarStock, RegistrarMovimientoStock } from '../../../API/APIStock';

const stockSinConfigurar = (producto) => ({
    id: producto.id,
    idProducto: producto.id,
    codigoProducto: producto.codigo || '',
    nombreProducto: producto.nombre,
    activo: producto.activo,
    configurado: false,
    controlaStock: false,
    enviarAlerta: false,
    cantidadActual: 0,
    cantidadMinima: 0,
    stockBajo: false,
    sinStock: false,
    fechaActualizacion: null,
});

export function useStock() {
    const [stock, setStock] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [productos, stockConfigurado] = await Promise.all([
                BuscarTodosLosProductos(),
                BuscarStock(),
            ]);
            const stockPorProducto = new Map(
                (Array.isArray(stockConfigurado) ? stockConfigurado : [])
                    .map((item) => [item.idProducto, item])
            );
            const filas = (Array.isArray(productos) ? productos : []).map((producto) => {
                const configurado = stockPorProducto.get(producto.id);
                return configurado
                    ? { ...configurado, id: producto.id, activo: producto.activo, configurado: true }
                    : stockSinConfigurar(producto);
            });
            setStock(filas);
        } catch (err) {
            setError(err);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const guardarConfiguracion = useCallback(async (producto, configuracion) => {
        await ConfigurarStock(producto.idProducto, configuracion);
        await cargar();
    }, [cargar]);

    const registrarMovimiento = useCallback(async (producto, movimiento) => {
        await RegistrarMovimientoStock(producto.idProducto, movimiento);
        await cargar();
    }, [cargar]);

    return useMemo(() => ({
        stock,
        cargando,
        error,
        cargar,
        guardarConfiguracion,
        registrarMovimiento,
    }), [stock, cargando, error, cargar, guardarConfiguracion, registrarMovimiento]);
}
