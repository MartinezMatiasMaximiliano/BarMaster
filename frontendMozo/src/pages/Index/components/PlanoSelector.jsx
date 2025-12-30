// components/PlanoSelector.jsx
import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * Componente para seleccionar un plano
 * @param {Object} props
 * @param {Array} props.planos - Array de planos disponibles
 * @param {string} props.planoSeleccionado - ID del plano seleccionado
 * @param {Function} props.onChange - Handler para cambiar el plano
 * @param {boolean} props.disabled - Si el selector está deshabilitado
 */
export const PlanoSelector = ({ planos, planoSeleccionado, onChange, disabled }) => {
    if (!planos || planos.length === 0) {
        return null;
    }

    return (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel id="plano-select-label">Seleccionar Plano</InputLabel>
                <Select
                    labelId="plano-select-label"
                    id="plano-select"
                    value={planoSeleccionado}
                    label="Seleccionar Plano"
                    onChange={onChange}
                    disabled={disabled}
                >
                    {planos.map((plano) => (
                        <MenuItem key={plano.id} value={plano.id}>
                            {plano.nombre}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

