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
                maxHeight: 'none',   // Sin límite de altura, el scroll lo maneja el contenedor padre
                overflowY: 'visible', // Sin scroll aquí, lo maneja el padre
                marginBottom: '0',
            }}
        >
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
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

