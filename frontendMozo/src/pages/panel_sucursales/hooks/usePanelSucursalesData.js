import { useCallback, useEffect, useMemo, useState } from 'react';
import { ObtenerEmpresaConSucursales, ObtenerResumenSucursales } from '../../../API/APIEmpresas';
import { calcularRangoPanel } from '../utils/dateRange';
import { useFacturacion } from './useFacturacion';

const normalizarEmpresa = (empresaData) => Array.isArray(empresaData) ? empresaData : [empresaData];

const calcularTotales = (sucursales) => {
    return sucursales.reduce((acc, sucursal) => {
        acc.ventasHoy += Number(sucursal.kpisHoy?.ventas || 0);
        acc.visitasHoy += Number(sucursal.kpisHoy?.cantidadVisitas || 0);
        acc.margenHoy += Number(sucursal.kpisHoy?.margenEstimado || 0);
        acc.cajasAbiertas += sucursal.caja?.abierta ? 1 : 0;
        return acc;
    }, {
        ventasHoy: 0,
        visitasHoy: 0,
        margenHoy: 0,
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

            setResumen(resumenData);
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

    const sucursales = resumen?.sucursales ?? [];
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
