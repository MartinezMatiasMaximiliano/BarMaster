import { useState, useEffect, useMemo } from 'react';
import { aplicarFiltro, obtenerTipoFiltro } from './filterUtils';

/**
 * Custom hook para manejar el estado y lógica de filtros
 * @param {Array} filas - Array de filas a filtrar
 * @param {Object} configuracionFiltros - Configuración de tipos y opciones para cada columna
 * @param {Function} onFiltrar - Callback que recibe las filas filtradas
 * @returns {Object} Estado y funciones del hook
 */
export const useFiltros = (filas, configuracionFiltros, onFiltrar) => {
    const [columnaSeleccionada, setColumnaSeleccionada] = useState('');
    const [valorFiltro, setValorFiltro] = useState('');

    // Obtener configuración y tipo de la columna seleccionada
    const configColumna = useMemo(() => {
        return columnaSeleccionada ? configuracionFiltros[columnaSeleccionada] : null;
    }, [columnaSeleccionada, configuracionFiltros]);

    const tipoColumna = useMemo(() => {
        return obtenerTipoFiltro(configColumna);
    }, [configColumna]);

    // Aplicar filtro cuando cambian los valores o las filas
    useEffect(() => {
        if (columnaSeleccionada && valorFiltro) {
            const filasFiltradas = aplicarFiltro(filas, columnaSeleccionada, valorFiltro, tipoColumna);
            onFiltrar(filasFiltradas);
        } else {
            onFiltrar(filas);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filas, columnaSeleccionada, valorFiltro, tipoColumna]);

    const handleColumnaChange = (nuevaColumna) => {
        setColumnaSeleccionada(nuevaColumna);
        setValorFiltro('');
        // Limpiar filtro cuando cambia la columna
        onFiltrar(filas);
    };

    const handleValorChange = (nuevoValor) => {
        setValorFiltro(nuevoValor);
    };

    const limpiarFiltros = () => {
        setColumnaSeleccionada('');
        setValorFiltro('');
        onFiltrar(filas);
    };

    const hayFiltroActivo = columnaSeleccionada && valorFiltro;

    return {
        columnaSeleccionada,
        valorFiltro,
        configColumna,
        tipoColumna,
        hayFiltroActivo,
        handleColumnaChange,
        handleValorChange,
        limpiarFiltros
    };
};

