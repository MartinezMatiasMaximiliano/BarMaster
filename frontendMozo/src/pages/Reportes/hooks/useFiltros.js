import { useState, useEffect } from 'react';

const FILTROS_STORAGE_KEY = 'reportes_filtros';

export const useFiltros = () => {
    // Cargar filtros guardados del localStorage
    const cargarFiltrosGuardados = () => {
        try {
            const guardados = localStorage.getItem(FILTROS_STORAGE_KEY);
            if (guardados) {
                return JSON.parse(guardados);
            }
        } catch (error) {
            console.error('Error al cargar filtros guardados:', error);
        }
        return null;
    };

    const filtrosGuardados = cargarFiltrosGuardados();

    const [filtros, setFiltros] = useState({
        tipoReporte: filtrosGuardados?.tipoReporte || 'ventas',
        fechaInicio: filtrosGuardados?.fechaInicio || '',
        fechaFin: filtrosGuardados?.fechaFin || '',
        idMozos: filtrosGuardados?.idMozos || [],
        idMesas: filtrosGuardados?.idMesas || [],
        idCategorias: filtrosGuardados?.idCategorias || [],
        idTipoPagos: filtrosGuardados?.idTipoPagos || [],
        estados: filtrosGuardados?.estados || []
    });

    // Guardar filtros en localStorage cuando cambien
    useEffect(() => {
        try {
            localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(filtros));
        } catch (error) {
            console.error('Error al guardar filtros:', error);
        }
    }, [filtros]);

    const actualizarFiltro = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const limpiarFiltros = () => {
        const filtrosLimpiados = {
            tipoReporte: 'ventas',
            fechaInicio: '',
            fechaFin: '',
            idMozos: [],
            idMesas: [],
            idCategorias: [],
            idTipoPagos: [],
            estados: []
        };
        setFiltros(filtrosLimpiados);
        try {
            localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(filtrosLimpiados));
        } catch (error) {
            console.error('Error al limpiar filtros:', error);
        }
    };

    const validarFiltros = () => {
        const errores = {};

        // Validar rango de fechas
        if (filtros.fechaInicio && filtros.fechaFin) {
            const inicio = new Date(filtros.fechaInicio);
            const fin = new Date(filtros.fechaFin);
            
            if (inicio > fin) {
                errores.fechas = 'La fecha de inicio debe ser anterior a la fecha de fin';
            }
        }

        return {
            valido: Object.keys(errores).length === 0,
            errores
        };
    };

    const obtenerFiltrosParaAPI = () => {
        const filtrosAPI = {};

        if (filtros.fechaInicio) {
            filtrosAPI.fechaInicio = filtros.fechaInicio;
        }
        if (filtros.fechaFin) {
            filtrosAPI.fechaFin = filtros.fechaFin;
        }
        if (filtros.idMesas && filtros.idMesas.length > 0) {
            filtrosAPI.idMesa = filtros.idMesas[0]; // Por ahora solo una mesa
        }
        if (filtros.estados && filtros.estados.length > 0) {
            filtrosAPI.estado = filtros.estados[0]; // Por ahora solo un estado
        }

        return filtrosAPI;
    };

    return {
        filtros,
        actualizarFiltro,
        limpiarFiltros,
        validarFiltros,
        obtenerFiltrosParaAPI
    };
};

