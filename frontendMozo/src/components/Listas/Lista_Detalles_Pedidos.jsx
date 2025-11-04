import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import FastfoodIcon from '@mui/icons-material/Fastfood';

export default function Lista_Detalles_Pedidos(props) {

    return (
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {props.items.map((item, index) => (
                <ListItem key={index} alignItems="flex-start">
                    <ListItemAvatar>
                        <Avatar>
                            <FastfoodIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={item.nombre}
                        secondary={item.indicaciones || "—"}
                    />
                </ListItem>
            ))}
        </List>
    );
}
