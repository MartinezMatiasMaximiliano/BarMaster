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
        props.handleChange(event, props.name);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{props.titulo}</InputLabel>
                <Select_
                    labelId={"demo-simple-select-label" + props.index}
                    id={"demo-simple-select"+ props.index}
                    value={value}
                    label={props.titulo}
                    onChange={handleChange}
                >
                    {props.datos_select.map((dato, i) => (
                        <MenuItem key={i} value={dato.id}>
                            {dato.nombre}
                        </MenuItem>
                    ))}
                </Select_>
            </FormControl>
        </Box>
    );
}

