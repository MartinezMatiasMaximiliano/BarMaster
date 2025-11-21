import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select_ from '@mui/material/Select';

export default function Select(props) {
    const [value, setValue] = React.useState(props.datoActual ? props.datoActual : '');

    const handleChange = (event) => {
        setValue(event.target.value);
        props.handleChange(event, props.campo.name);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth className="mb-3">
                <InputLabel id="demo-simple-select-label">{props.campo.label}</InputLabel>
                <Select_
                    value={value}
                    label={props.campo.label}
                    onChange={handleChange}
                >
                    {props.campo.options.map((dato, i) => (
                        <MenuItem key={i} value={dato.id}>
                            {dato.nombre}
                        </MenuItem>
                    ))}
                </Select_>
            </FormControl>
        </Box>
    );
}

