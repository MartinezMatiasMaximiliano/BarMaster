import React, { useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select_ from '@mui/material/Select';

export default function Select(props) {
    // Manejar valor inicial: si es null, undefined o vacío, usar cadena vacía
    const valorInicial = props.datoActual !== null && props.datoActual !== undefined && props.datoActual !== '' 
        ? props.datoActual 
        : '';
    const [value, setValue] = useState(valorInicial);

    const handleChange = (event) => {
        const nuevoValor = event.target.value;
        setValue(nuevoValor);
        // Pasar el tipo 'select' para que el handler lo procese correctamente
        props.handleChange(event, props.campo.name, 'select');
    };

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">{props.campo.label}</InputLabel>
            <Select_
                    value={value}
                    label={props.campo.label}
                    onChange={handleChange}
                >
                    {props.campo.options.map((dato, i) => (
                        <MenuItem key={i} value={dato.id === null ? '' : dato.id}>
                            {dato.nombre}
                        </MenuItem>
                    ))}
                </Select_>
        </FormControl>
    );
}

