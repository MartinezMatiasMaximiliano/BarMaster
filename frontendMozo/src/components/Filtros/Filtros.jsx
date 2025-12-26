import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import { obtenerColumnasFiltrables } from './filterUtils';
import { useFiltros } from './useFiltros';
import FiltroColumnaSelect from './FiltroColumnaSelect';
import FiltroInput from './FiltroInput';
import FiltroClearButton from './FiltroClearButton';

/**
 * Componente de filtrado dinámico para tablas ABM
 * @param {Array} filas - Array de filas a filtrar
 * @param {Array} columnas - Array de columnas de la tabla (excluyendo __acciones)
 * @param {Object} configuracionFiltros - Configuración de tipos y opciones para cada columna
 *   Ejemplo: {
 *     estado: { tipo: 'select', opciones: [{ id: 1, nombre: 'Pendiente' }, ...] },
 *     nombre: { tipo: 'text' },
 *     precio: { tipo: 'number' }
 *   }
 * @param {Function} onFiltrar - Callback que recibe las filas filtradas
 */
function Filtros({ filas, columnas = [], configuracionFiltros = {}, onFiltrar }) {
    // Filtrar columnas excluyendo las que no son filtrables
    const columnasFiltrables = useMemo(() => {
        return obtenerColumnasFiltrables(columnas);
    }, [columnas]);

    // Si no hay columnas filtrables, no mostrar el componente
    if (!columnasFiltrables || columnasFiltrables.length === 0) {
        return null;
    }

    // Hook personalizado para manejar el estado y lógica de filtros
    const {
        columnaSeleccionada,
        valorFiltro,
        configColumna,
        tipoColumna,
        hayFiltroActivo,
        handleColumnaChange,
        handleValorChange,
        limpiarFiltros
    } = useFiltros(filas, configuracionFiltros, onFiltrar);

    return (
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FiltroColumnaSelect
                columnasFiltrables={columnasFiltrables}
                columnaSeleccionada={columnaSeleccionada}
                onChange={handleColumnaChange}
            />

            {columnaSeleccionada && (
                <FiltroInput
                    tipoColumna={tipoColumna}
                    valorFiltro={valorFiltro}
                    onChange={handleValorChange}
                    configColumna={configColumna}
                    filas={filas}
                    columnaSeleccionada={columnaSeleccionada}
                />
            )}

            {hayFiltroActivo && (
                <FiltroClearButton onClear={limpiarFiltros} />
            )}
        </Stack>
    );
}

export default Filtros;
