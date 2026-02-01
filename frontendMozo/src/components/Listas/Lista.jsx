import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

export default function Lista(props) {

    const [checked, setChecked] = useState([0]);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    return (
        <div
            style={{
                maxHeight: '40vh',   // Ajusta la altura máxima que deseas
                overflowY: 'auto',    // Habilita el scroll vertical
                marginBottom: '2em',
            }}
        >
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {props.items.map((item, i) => {
                    // Mostrar solo productos que no estén pagados
                    if (!item.estadoPagado) {
                        const labelId = `checkbox-list-label-${item}-${i}`;

                        return (
                            <ListItem key={labelId} disablePadding onClick={() => props.handleCheckBox(item.id)}>
                                <ListItemButton role={undefined} onClick={handleToggle(item)} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checked.includes(item)}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }} />
                                    </ListItemIcon>
                                    <ListItemText id={labelId} primary={item.nombre || item.nombreProducto} secondary={item.indicaciones || item.detalles} />
                                </ListItemButton>
                            </ListItem>
                        );
                    }
                })}
                </List>
        </div>
    );
}

