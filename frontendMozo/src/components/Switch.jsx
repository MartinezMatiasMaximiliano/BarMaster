import * as React from 'react';
import Switch_ from '@mui/material/Switch';

export default function Switch(props) {
    const [checked, setChecked] = React.useState(props.activo);
    const id = props.id;

    const handleChange = (event) => {
        setChecked(event.target.checked);
        event.target.checked ? props.activar(id) : props.desactivar(id);
    };

    return (
        <Switch_
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
        />
    );
}

