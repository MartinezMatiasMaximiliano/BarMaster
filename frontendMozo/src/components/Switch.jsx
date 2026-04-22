import React, { useEffect, useState } from 'react';
import { Switch as MUISwitch } from '@mui/material';

export default function Switch(props) {
    const [checked, setChecked] = useState(props.activo);
    const [loading, setLoading] = useState(false);
    const id = props.id;

    useEffect(() => {
        setChecked(Boolean(props.activo));
    }, [props.activo]);

    const handleChange = async (event) => {
        const nuevoEstado = event.target.checked;
        setChecked(nuevoEstado);
        setLoading(true);
        try {
            nuevoEstado ? await props.activar(id) : await props.desactivar(id);
            if (props.onSuccess) {
                await props.onSuccess();
            }
        } catch (error) {
            // Revertir el switch si la API falla
            setChecked(!nuevoEstado);
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MUISwitch
            checked={checked}
            onChange={handleChange}
            disabled={loading}
            inputProps={{ 'aria-label': 'Activar/Desactivar' }}
            color="primary"
            size="small"
        />
    );
}
