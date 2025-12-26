import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * Componente para seleccionar la columna por la cual filtrar
 * @param {Array} columnasFiltrables - Array de columnas filtrables
 * @param {string} columnaSeleccionada - Columna actualmente seleccionada
 * @param {Function} onChange - Callback cuando cambia la selección
 */
function FiltroColumnaSelect({ columnasFiltrables, columnaSeleccionada, onChange }) {
    return (
        <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="columna-filtro-label">
                <FilterListIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1rem' }} />
                Filtrar por
            </InputLabel>
            <Select
                labelId="columna-filtro-label"
                id="columna-filtro"
                value={columnaSeleccionada}
                label="Filtrar por"
                onChange={(e) => onChange(e.target.value)}
            >
                <MenuItem value="">
                    <em>Seleccionar columna</em>
                </MenuItem>
                {columnasFiltrables.map((columna) => (
                    <MenuItem key={columna.key} value={columna.key}>
                        {columna.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default FiltroColumnaSelect;

