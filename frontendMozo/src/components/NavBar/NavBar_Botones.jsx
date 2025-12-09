import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const menuConfig = {
    Encargado: [
        { path: "/abm_menu", label: "ABM MENU", icon: RestaurantMenuOutlinedIcon },
        { path: "/abm_mesas", label: "ABM Mesas", icon: TableRestaurantOutlinedIcon },
        { path: "/abm_categorias", label: "ABM Categorías", icon: CategoryOutlinedIcon },
        { path: "/abm_personas", label: "ABM Personas", icon: GroupOutlinedIcon },
        { path: "/delivery_takeaway", label: "Delivery/Take Away", icon: DeliveryDiningOutlinedIcon },
        { path: "/lista_mozos", label: "Listado de Mozos", icon: ChecklistOutlinedIcon },
        { path: "/distribucion_mesas", label: "Distribución de las Mesas", icon: AppsOutlinedIcon },
        { path: "/caja", label: "Caja", icon: PointOfSaleOutlinedIcon },
        { path: "/cambiar_clave", label: "Cambiar Contraseña", icon: LockResetOutlinedIcon },
        { path: "/graficas", label: "Graficas", icon: QueryStatsOutlinedIcon },
        { path: "/mi_plan", label: "Mi Plan", icon: StarOutlineOutlinedIcon },
        { path: "/panel_sucursales", label: "Panel de Sucursales", icon: StoreOutlinedIcon },
    ],
    Cajero: [
        { path: "/abm_menu", label: "Gestión de Menu", icon: RestaurantMenuOutlinedIcon },
        { path: "/delivery_takeaway", label: "Delivery/Take Away", icon: DeliveryDiningOutlinedIcon },
        { path: "/lista_mozos", label: "Listado de Mozos", icon: ChecklistOutlinedIcon },
        { path: "/abm_mesas", label: "Gestión de Mesas", icon: TableRestaurantOutlinedIcon },
        { path: "/distribucion_mesas", label: "Distribución de las Mesas", icon: AppsOutlinedIcon },
        { path: "/caja", label: "Caja", icon: PointOfSaleOutlinedIcon },
        { path: "/abm_categorias", label: "Gestión de Categorías", icon: CategoryOutlinedIcon },
        { path: "/cambiar_clave", label: "Cambiar Contraseña", icon: LockResetOutlinedIcon },
    ],
};

function NavBar_Botones(props) {
    const [showLogout, setShowLogout] = useState(false);

    if (!props.logeado) {
        return (
            <List dense disablePadding>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/login">
                        <ListItemIcon sx={{ minWidth: 32 }}>
                            <LoginOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Login" />
                    </ListItemButton>
                </ListItem>
            </List>
        );
    }

    const menuItems = menuConfig[props.rol] || [];

    return (
        <Stack spacing={2}>
            <List dense disablePadding>
                {menuItems.map(({ path, label, icon: Icon }) => (
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
            <List dense disablePadding>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => setShowLogout(true)}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                            <LogoutOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar sesión" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Dialog open={showLogout} onClose={() => setShowLogout(false)}>
                <DialogTitle>Cerrar sesión</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Querés cerrar la sesión actual?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowLogout(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setShowLogout(false);
                            props.cerrarSesion();
                        }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

export default NavBar_Botones;
