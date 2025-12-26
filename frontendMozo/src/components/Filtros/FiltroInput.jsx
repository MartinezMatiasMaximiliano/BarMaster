import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import { FILTER_TYPES, FILTER_INPUT_PROPS } from './constants';
import { obtenerOpcionesSelect } from './filterUtils';

/**
 * Componente para el input de filtro según el tipo
 * @param {string} tipoColumna - Tipo de filtro (text, number, select)
 * @param {string} valorFiltro - Valor actual del filtro
 * @param {Function} onChange - Callback cuando cambia el valor
 * @param {Object} configColumna - Configuración de la columna
 * @param {Array} filas - Array de filas de datos
 * @param {string} columnaSeleccionada - Nombre de la columna seleccionada
 */
function FiltroInput({ 
    tipoColumna, 
    valorFiltro, 
    onChange, 
    configColumna, 
    filas, 
    columnaSeleccionada 
}) {
    if (tipoColumna === FILTER_TYPES.SELECT) {
        const opcionesSelect = obtenerOpcionesSelect(configColumna, filas, columnaSeleccionada);
        const props = FILTER_INPUT_PROPS[FILTER_TYPES.SELECT];

        return (
            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="valor-select-label">{props.label}</InputLabel>
                <Select
                    labelId="valor-select-label"
                    id="valor-select"
                    value={valorFiltro}
                    label={props.label}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <MenuItem value="">
                        <em>Todos</em>
                    </MenuItem>
                    {opcionesSelect.map((opt) => (
                        <MenuItem key={opt.id || opt.nombre} value={opt.nombre}>
                            {opt.nombre}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    if (tipoColumna === FILTER_TYPES.TEXT || tipoColumna === FILTER_TYPES.NUMBER) {
        const props = FILTER_INPUT_PROPS[tipoColumna];

        return (
            <TextField
                size="small"
                type={props.type}
                label={props.label}
                value={valorFiltro}
                onChange={(e) => onChange(e.target.value)}
                sx={{ minWidth: 180 }}
                placeholder={props.placeholder}
            />
        );
    }

    return null;
}

export default FiltroInput;

