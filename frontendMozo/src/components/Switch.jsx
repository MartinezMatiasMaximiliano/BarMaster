import React, { useState } from 'react';
import { Switch as MUISwitch } from '@mui/material';

export default function Switch(props) {
    const [checked, setChecked] = useState(props.activo);
    const id = props.id;

    const handleChange = (event) => {
        setChecked(event.target.checked);
        event.target.checked ? props.activar(id) : props.desactivar(id);
    };

    return (
        <MUISwitch
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'Activar/Desactivar' }}
            color="primary"
            size="small"
        />
    );
}

