import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LoginContext } from "../../App";
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import NavBar_Botones from './NavBar_Botones'
import NavBar_Chip from './NavBar_Chip'

function NavBar() {

    const loginProvider = useContext(LoginContext);

    function cerrarSesion() {
        localStorage.clear();
        loginProvider.setLogeado(false);
        loginProvider.setRol("");
    }

    const quickLinks = [
        { path: "/", label: "Mesas 1", icon: TableRestaurantOutlinedIcon },
        { path: "/index2", label: "Mesas 2 (plano)", icon: AppsOutlinedIcon }
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                px: 2,
                py: 3,
                gap: 2
            }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={{ height: '20vh', objectFit: 'contain' }}
                />
            </Box>
            <List dense disablePadding>
                {quickLinks.map(({ path, label, icon: Icon }) => (
                    <ListItem disablePadding key={path}>
                        <ListItemButton component={Link} to={path}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <Icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <NavBar_Botones
                logeado={loginProvider.logeado}
                rol={loginProvider.rol}
                cerrarSesion={cerrarSesion}
            />
            <Box mt="auto">
                <NavBar_Chip logeado={loginProvider.logeado} />
            </Box>
        </Box>
    );
}

export default NavBar;
