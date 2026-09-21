import { useEffect, useState } from 'react';
import { BuscarAlertasStock } from '../API/APIStock';
import useSignalR from '../hooks/useSignalR';
import StockAlertCard from './StockAlertCard';

function StockAlerts({ refreshKey }) {
    const [productos, setProductos] = useState([]);
    const [alertasDescartadas, setAlertasDescartadas] = useState(() => new Set());
    const [revisionStock, setRevisionStock] = useState(0);

    useSignalR({
        onStockActualizado: () => setRevisionStock((revisionActual) => revisionActual + 1),
    });

    useEffect(() => {
        let cancelled = false;

        const cargarAlertas = async () => {
            try {
                const alertas = await BuscarAlertasStock();
                if (!cancelled) setProductos(Array.isArray(alertas) ? alertas : []);
            } catch (error) {
                console.error('Error al cargar las alertas de stock:', error);
                if (!cancelled) setProductos([]);
            }
        };

        cargarAlertas();

        return () => {
            cancelled = true;
        };
    }, [refreshKey, revisionStock]);

    return productos
        .map((producto) => ({
            producto,
            claveAlerta: `${producto.idProducto}-${producto.fechaInicioStockBajo ?? 'sin-fecha'}`,
        }))
        .filter(({ claveAlerta }) => !alertasDescartadas.has(claveAlerta))
        .map(({ producto, claveAlerta }) => (
            <StockAlertCard
                key={claveAlerta}
                producto={producto}
                onDismiss={() => setAlertasDescartadas((anteriores) => {
                    const nuevasAlertasDescartadas = new Set(anteriores);
                    nuevasAlertasDescartadas.add(claveAlerta);
                    return nuevasAlertasDescartadas;
                })}
            />
        ));
}

export default StockAlerts;
