import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../../App";
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import NavBar_Botones from './NavBar_Botones'
import NavBar_Chip from './NavBar_Chip'

function NavBar() {

    const loginProvider = useContext(LoginContext);
    const navigate = useNavigate();

    function cerrarSesion() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("USER_")) {
              localStorage.removeItem(key);
            }
          });
        loginProvider.setLogeadoUsuario(false);
        loginProvider.setRol("");
        navigate('/');
    }

    const quickLinks = [
        { path: "/sistema_sucursal", label: "Mesas 1", icon: TableRestaurantOutlinedIcon },
        { path: "/Index2", label: "Mesas 2 (plano)", icon: AppsOutlinedIcon }
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
                logeadoUsuario={loginProvider.logeadoUsuario}
                rol={loginProvider.rol}
                cerrarSesion={cerrarSesion}
            />
            <Box mt="auto">
                <NavBar_Chip logeado={loginProvider.logeadoUsuario} />
            </Box>
        </Box>
    );
}

export default NavBar;
