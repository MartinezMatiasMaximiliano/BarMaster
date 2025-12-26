import React from 'react';
import {
    IconButton,
    Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * Componente para el botón de limpiar filtros
 * @param {Function} onClear - Callback cuando se hace clic en limpiar
 */
function FiltroClearButton({ onClear }) {
    return (
        <Tooltip title="Limpiar filtros">
            <IconButton 
                size="small" 
                onClick={onClear}
                color="primary"
            >
                <ClearIcon />
            </IconButton>
        </Tooltip>
    );
}

export default FiltroClearButton;

