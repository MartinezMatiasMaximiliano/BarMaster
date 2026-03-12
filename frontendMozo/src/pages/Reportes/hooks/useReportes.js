import React, { useState, useEffect, useMemo } from 'react';
import { BuscarTodasLasVisitas } from '../../../API/APIVisitas';
import { BuscarTodasLasMesas } from '../../../API/APIMesas';
import { BuscarTodosLosProductos } from '../../../API/APIProductos';
import { BuscarTodasLasCategorias } from '../../../API/APICategorias';
import { BuscarTipoMovimientosPorEntorno } from '../../../API/APITipoMovimientosCaja';
import { useDatosVentas } from '../reportes/ventas/useDatosVentas';
import { useDatosProductos } from '../reportes/productos/useDatosProductos';
import { useDatosMozos } from '../reportes/mozos/useDatosMozos';
import { useDatosMesas } from '../reportes/mesas/useDatosMesas';
import { useDatosRentabilidad } from '../reportes/rentabilidad/useDatosRentabilidad';

/** Normaliza mesas de la API al formato esperado por filtros (id, nombre, idMozo). */
function normalizarMesasParaReportes(mesas) {
    return mesas.map(m => ({
        id: m.id,
        nombre: m.nombre ?? '',
        idMozo: m.visita?.mozo?.id ?? null
    }));
}

/** Normaliza una visita de la API (productosConsumidos) al formato esperado (productos, pagos). */
function normalizarVisitaParaReportes(visita) {
    const productos = visita.productos ?? (visita.productosConsumidos ?? []).map(p => ({
        cantidad: p.cantidad ?? p.Cantidad ?? 1,
        precioTotal: p.precio ?? p.Precio ?? 0,
        nombreProducto: p.nombre ?? p.Nombre ?? '',
        idProducto: p.idProducto ?? p.IdProducto ?? null
    }));
    const pagos = visita.pagos ?? [];
    return { ...visita, productos, pagos };
}

/**
 * Hook orquestador: carga datos crudos, aplica filtros y expone datos por tipo de reporte.
 * La lógica específica de cada reporte está en reportes/<tipo>/useDatos*.js
 *
 * Las visitas NO se cargan al montar — se cargan cuando el usuario usa los filtros de fecha
 * o presiona "Histórico". Los catálogos (mesas, productos, categorías, tipoPagos) sí se
 * cargan al montar porque son necesarios para los dropdowns de filtros.
 */
export const useReportes = (filtros) => {
    const [visitas, setVisitas] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [tipoPagos, setTipoPagos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);
    const [error, setError] = useState(null);
    const [datosCargados, setDatosCargados] = useState(false);

    // Cargar catálogos al montar (necesarios para dropdowns de filtros)
    useEffect(() => {
        const cargarCatalogos = async () => {
            setLoadingCatalogos(true);
            try {
                const [mesasData, productosData, categoriasData, tipoPagosData] = await Promise.all([
                    BuscarTodasLasMesas(),
                    BuscarTodosLosProductos(),
                    BuscarTodasLasCategorias(),
                    BuscarTipoMovimientosPorEntorno('Ventas')
                ]);
                setMesas(normalizarMesasParaReportes(Array.isArray(mesasData) ? mesasData : []));
                setProductos(Array.isArray(productosData) ? productosData : []);
                setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
                setTipoPagos(Array.isArray(tipoPagosData) ? tipoPagosData : []);
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
                setError('Error al cargar los datos auxiliares.');
            } finally {
                setLoadingCatalogos(false);
            }
        };
        cargarCatalogos();
    }, []);

    // Función para cargar visitas (llamada por el usuario via "Buscar" o "Histórico")
    const cargarVisitas = async () => {
        setLoading(true);
        setError(null);
        try {
            const visitasData = await BuscarTodasLasVisitas({});
            setVisitas((Array.isArray(visitasData) ? visitasData : []).map(normalizarVisitaParaReportes));
            setDatosCargados(true);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los datos. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const visitasFiltradas = useMemo(() => {
        if (!datosCargados) return [];

        let filtradas = [...visitas];

        if (filtros.filtros.fechaInicio) {
            const fechaInicio = new Date(filtros.filtros.fechaInicio);
            filtradas = filtradas.filter(v => new Date(v.fechaHora) >= fechaInicio);
        }
        if (filtros.filtros.fechaFin) {
            const fechaFin = new Date(filtros.filtros.fechaFin);
            fechaFin.setHours(23, 59, 59, 999);
            filtradas = filtradas.filter(v => new Date(v.fechaHora) <= fechaFin);
        }

        if (filtros.filtros.idMozos?.length > 0) {
            const mesasMozos = mesas.filter(m => filtros.filtros.idMozos.includes(m.idMozo));
            const idsMesas = mesasMozos.map(m => m.id);
            filtradas = filtradas.filter(v => idsMesas.includes(v.idMesa));
        }
        if (filtros.filtros.idMesas?.length > 0) {
            filtradas = filtradas.filter(v => filtros.filtros.idMesas.includes(v.idMesa));
        }

        if (filtros.filtros.idCategorias?.length > 0) {
            const idCategoriasSet = new Set(filtros.filtros.idCategorias.map(id => String(id)));
            const productosCategorias = productos.filter(p => {
                const idCat = p.idCategoria;
                return idCat != null && idCategoriasSet.has(String(idCat));
            });
            const nombresProductos = new Set(productosCategorias.map(p => p.nombre ?? ''));
            filtradas = filtradas.filter(v =>
                v.productos?.some(p => nombresProductos.has(p.nombreProducto ?? p.nombre))
            );
        }

        if (filtros.filtros.idTipoPagos?.length > 0) {
            filtradas = filtradas.filter(v =>
                (v.pagos ?? []).some(p => filtros.filtros.idTipoPagos.includes(String(p.idTipoPago)))
            );
        }
        if (filtros.filtros.estados?.length > 0) {
            filtradas = filtradas.filter(v => filtros.filtros.estados.includes(v.estado));
        }

        return filtradas;
    }, [
        visitas,
        mesas,
        productos,
        datosCargados,
        filtros.filtros.fechaInicio,
        filtros.filtros.fechaFin,
        filtros.filtros.idMozos?.join(','),
        filtros.filtros.idMesas?.join(','),
        filtros.filtros.idCategorias?.join(','),
        filtros.filtros.idTipoPagos?.join(','),
        filtros.filtros.estados?.join(',')
    ]);

    const metricas = useMemo(() => {
        const totalVentas = visitasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0);
        const cantidadVisitas = visitasFiltradas.length;
        const promedioPorVisita = cantidadVisitas > 0 ? totalVentas / cantidadVisitas : 0;
        const productosVendidos = visitasFiltradas.reduce((sum, v) => {
            const prods = v.productos ?? [];
            return sum + prods.reduce((prodSum, p) => prodSum + (p.cantidad || 0), 0);
        }, 0);
        const margenGanancia = visitasFiltradas.reduce((sum, v) => {
            const prods = v.productos ?? [];
            const margenVisita = prods.reduce((prodSum, p) => {
                const producto = productos.find(prod => prod.nombre === (p.nombreProducto ?? p.nombre));
                const costoUnit = producto?.costo;
                if (producto && costoUnit != null) {
                    const costoTotal = Number(costoUnit) * p.cantidad;
                    return prodSum + (p.precioTotal - costoTotal);
                }
                return prodSum;
            }, 0);
            return sum + margenVisita;
        }, 0);

        return {
            totalVentas,
            cantidadVisitas,
            promedioPorVisita,
            productosVendidos,
            margenGanancia
        };
    }, [visitasFiltradas, productos]);

    const datosVentas = useDatosVentas(visitasFiltradas, tipoPagos);
    const datosProductos = useDatosProductos(visitasFiltradas, productos, categorias);
    const datosMozos = useDatosMozos(visitasFiltradas, productos);
    const datosMesas = useDatosMesas(visitasFiltradas);
    const datosRentabilidad = useDatosRentabilidad(visitasFiltradas, productos, datosProductos);

    return {
        visitas: visitasFiltradas,
        mesas,
        productos,
        categorias,
        tipoPagos,
        metricas,
        datosVentas,
        datosProductos,
        datosMozos,
        datosMesas,
        datosRentabilidad,
        loading: loading || loadingCatalogos,
        error,
        datosCargados,
        cargarVisitas
    };
};
