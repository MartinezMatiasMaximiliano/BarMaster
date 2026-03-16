import React, { useState } from 'react';
import { Switch as MUISwitch } from '@mui/material';

export default function Switch(props) {
    const [checked, setChecked] = useState(props.activo);
    const id = props.id;

    const handleChange = async (event) => {
        const nuevoEstado = event.target.checked;
        setChecked(nuevoEstado);
        try {
            nuevoEstado ? await props.activar(id) : await props.desactivar(id);
        } catch (error) {
            // Revertir el switch si la API falla
            setChecked(!nuevoEstado);
            console.error(error.message);
        }
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
