import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(name, value, theme) {
    return {
        fontWeight: value.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

export default function Select_Multiple(props) {
    const theme = useTheme();
    const [itemsActivos, setItemsActivos] = useState(props.itemsActivos || []);

    const itemsTotales = props.campo.options || [];
    
    // Verificar si las opciones son objetos (con id y nombre) o strings simples
    const esObjeto = itemsTotales.length > 0 && typeof itemsTotales[0] === 'object' && itemsTotales[0].id;

    // Actualizar itemsActivos cuando cambien desde props (útil para edición).
    // Solo se aplica si hay valores reales para no pisar la selección local del usuario.
    useEffect(() => {
        if (props.itemsActivos && props.itemsActivos.length > 0) {
            setItemsActivos(props.itemsActivos);
        }
    }, [props.itemsActivos]);

    const handleChange = (event) => {
        props.handleChange(event, props.campo.name, "select_multiple");
        const {
            target: { value },
        } = event;
        setItemsActivos(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    // Función para obtener el nombre de una categoría (ya sea objeto o string)
    const obtenerNombre = (item) => {
        if (esObjeto) {
            const categoria = itemsTotales.find(cat => cat.id === item);
            return categoria ? categoria.nombre : item;
        }
        return item;
    };

    return (
        <FormControl fullWidth error={Boolean(props.error)}>
            <InputLabel id="demo-multiple-chip-label">{props.campo.label}</InputLabel>
            <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={itemsActivos}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label={props.campo.label} />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={obtenerNombre(value)} />
                        ))}
                    </Box>
                )}
                MenuProps={MenuProps}
            >
                {itemsTotales.map((cat) => {
                    const valor = esObjeto ? cat.id : cat;
                    const etiqueta = esObjeto ? cat.nombre : cat;
                    return (
                        <MenuItem
                            key={valor}
                            value={valor}
                            style={getStyles(valor, itemsActivos, theme)}
                        >
                            {etiqueta}
                        </MenuItem>
                    );
                })}
            </Select>
            <FormHelperText>{props.helperText || ' '}</FormHelperText>
        </FormControl>
    );
}

