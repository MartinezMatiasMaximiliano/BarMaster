import { useCallback, useEffect, useMemo, useState } from 'react';
import { ObtenerEmpresaConSucursales, ObtenerResumenSucursales } from '../../../API/APIEmpresas';
import { calcularRangoPanel } from '../utils/dateRange';
import { useFacturacion } from './useFacturacion';

const normalizarEmpresa = (empresaData) => Array.isArray(empresaData) ? empresaData : [empresaData];
const SIN_SUCURSALES = [];

const obtenerCampo = (objeto, camelCase, pascalCase) => objeto?.[camelCase] ?? objeto?.[pascalCase];

const normalizarKpis = (kpis = {}) => ({
    ventas: Number(obtenerCampo(kpis, 'ventas', 'Ventas') || 0),
    cantidadVisitas: Number(obtenerCampo(kpis, 'cantidadVisitas', 'CantidadVisitas') || 0),
    ticketPromedio: Number(obtenerCampo(kpis, 'ticketPromedio', 'TicketPromedio') || 0),
    margenEstimado: Number(obtenerCampo(kpis, 'margenEstimado', 'MargenEstimado') || 0),
    margenPorcentaje: Number(obtenerCampo(kpis, 'margenPorcentaje', 'MargenPorcentaje') || 0),
    rentabilidadIncompleta: Boolean(obtenerCampo(kpis, 'rentabilidadIncompleta', 'RentabilidadIncompleta'))
});

const normalizarCaja = (caja = {}) => ({
    abierta: Boolean(obtenerCampo(caja, 'abierta', 'Abierta')),
    idCaja: obtenerCampo(caja, 'idCaja', 'IdCaja'),
    fechaApertura: obtenerCampo(caja, 'fechaApertura', 'FechaApertura'),
    montoApertura: Number(obtenerCampo(caja, 'montoApertura', 'MontoApertura') || 0),
    montoActual: Number(obtenerCampo(caja, 'montoActual', 'MontoActual') || 0),
    montoEfectivo: Number(obtenerCampo(caja, 'montoEfectivo', 'MontoEfectivo') || 0),
    montoNoEfectivo: Number(obtenerCampo(caja, 'montoNoEfectivo', 'MontoNoEfectivo') || 0)
});

const normalizarSeries = (series = {}) => ({
    ventasPorHoraPeriodo: obtenerCampo(series, 'ventasPorHoraPeriodo', 'VentasPorHoraPeriodo') ?? [],
    ventasPorDia: obtenerCampo(series, 'ventasPorDia', 'VentasPorDia') ?? []
});

const normalizarTopProductos = (productos = []) => productos.map(producto => ({
    nombre: obtenerCampo(producto, 'nombre', 'Nombre') || 'Sin nombre',
    cantidad: Number(obtenerCampo(producto, 'cantidad', 'Cantidad') || 0),
    ventas: Number(obtenerCampo(producto, 'ventas', 'Ventas') || 0),
    margenEstimado: Number(obtenerCampo(producto, 'margenEstimado', 'MargenEstimado') || 0)
}));

const normalizarSucursalResumen = (sucursal = {}) => {
    const kpisPeriodo = normalizarKpis(obtenerCampo(sucursal, 'kpisPeriodo', 'KpisPeriodo'));

    return {
        id: obtenerCampo(sucursal, 'id', 'Id'),
        nombre: obtenerCampo(sucursal, 'nombre', 'Nombre'),
        direccion: obtenerCampo(sucursal, 'direccion', 'Direccion'),
        telefono: obtenerCampo(sucursal, 'telefono', 'Telefono'),
        caja: normalizarCaja(obtenerCampo(sucursal, 'caja', 'Caja')),
        kpisPeriodo,
        series: normalizarSeries(obtenerCampo(sucursal, 'series', 'Series')),
        topProductos: normalizarTopProductos(obtenerCampo(sucursal, 'topProductos', 'TopProductos') ?? [])
    };
};

const normalizarResumen = (resumenData) => {
    const sucursales = obtenerCampo(resumenData, 'sucursales', 'Sucursales') ?? [];

    return {
        empresaId: obtenerCampo(resumenData, 'empresaId', 'EmpresaId'),
        empresaNombre: obtenerCampo(resumenData, 'empresaNombre', 'EmpresaNombre'),
        desde: obtenerCampo(resumenData, 'desde', 'Desde'),
        hasta: obtenerCampo(resumenData, 'hasta', 'Hasta'),
        sucursales: sucursales.map(normalizarSucursalResumen)
    };
};

const calcularTotales = (sucursales) => {
    return sucursales.reduce((acc, sucursal) => {
        acc.ventasPeriodo += Number(sucursal.kpisPeriodo?.ventas || 0);
        acc.visitasPeriodo += Number(sucursal.kpisPeriodo?.cantidadVisitas || 0);
        acc.margenPeriodo += Number(sucursal.kpisPeriodo?.margenEstimado || 0);
        acc.cajasAbiertas += sucursal.caja?.abierta ? 1 : 0;
        return acc;
    }, {
        ventasPeriodo: 0,
        visitasPeriodo: 0,
        margenPeriodo: 0,
        cajasAbiertas: 0
    });
};

export const usePanelSucursalesData = (periodoDias) => {
    const [empresasPlan, setEmpresasPlan] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const rango = useMemo(() => calcularRangoPanel(periodoDias), [periodoDias]);
    const { desgloseFacturacion, totalCalculado } = useFacturacion(empresasPlan);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [resumenData, empresaData] = await Promise.all([
                ObtenerResumenSucursales(rango.desde, rango.hasta),
                ObtenerEmpresaConSucursales()
            ]);

            setResumen(normalizarResumen(resumenData));
            setEmpresasPlan(normalizarEmpresa(empresaData));
        } catch {
            setError('No se pudo cargar el desempeño de las sucursales.');
        } finally {
            setLoading(false);
        }
    }, [rango.desde, rango.hasta]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const sucursales = resumen?.sucursales ?? SIN_SUCURSALES;
    const totales = useMemo(() => calcularTotales(sucursales), [sucursales]);

    return {
        desgloseFacturacion,
        error,
        loading,
        rango,
        resumen,
        sucursales,
        totalCalculado,
        totales,
        cargarDatos
    };
};
