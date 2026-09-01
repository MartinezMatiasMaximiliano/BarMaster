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
    ListItemText,
    Collapse
} from "@mui/material";
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import KitchenIcon from '@mui/icons-material/Kitchen';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const menuConfig = {
    admin: {
        "Gestión": [
            { path: "/abm_productos", label: "Productos", icon: RestaurantMenuOutlinedIcon },
            { path: "/stock", label: "Stock", icon: Inventory2OutlinedIcon },
            { path: "/abm_mesas", label: "Mesas", icon: TableRestaurantOutlinedIcon },
            { path: "/abm_categorias", label: "Categorías", icon: CategoryOutlinedIcon },
            { path: "/abm_tipo_envios", label: "Tipos de Envío", icon: DeliveryDiningOutlinedIcon },
            { path: "/abm_personas", label: "Personas", icon: GroupOutlinedIcon },
            { path: "/abm_planos", label: "Planos", icon: MapOutlinedIcon },
            { path: "/lista_mozos", label: "Listado de Mozos", icon: ChecklistOutlinedIcon },
        ],
        "Operaciones": [
            { path: "/reservas", label: "Reservas", icon: EventNoteOutlinedIcon },
            { path: "/delivery", label: "Delivery", icon: DeliveryDiningOutlinedIcon },
            { path: "/takeaway", label: "Take Away", icon: ShoppingBagOutlinedIcon },
            { path: "/kds", label: "Vista de Cocina", icon: KitchenIcon },
            { path: "/distribucion_mesas", label: "Distribución de las Mesas", icon: AppsOutlinedIcon },
        ],
        "Caja": [
            { path: "/caja", label: "Arqueo", icon: ReceiptOutlinedIcon },
            { path: "/movimiento_caja", label: "Nuevo Movimiento", icon: AddCircleOutlinedIcon },
            { path: "/abm_cuentas_corrientes", label: "Cuentas Corrientes", icon: AccountBalanceWalletOutlinedIcon },
        ],
        "Reportes": [
            { path: "/reporte_resumido", label: "Reporte Resumido", icon: AssessmentOutlinedIcon },
            { path: "/reporte_ventas", label: "Reporte Ventas", icon: AssessmentOutlinedIcon },
            { path: "/reporte_productos", label: "Reporte Productos", icon: AssessmentOutlinedIcon },
            { path: "/reporte_mozos", label: "Reporte Mozos", icon: AssessmentOutlinedIcon },
            { path: "/reporte_mesas", label: "Reporte Mesas", icon: AssessmentOutlinedIcon },
            { path: "/reporte_rentabilidad", label: "Reporte Rentabilidad", icon: AssessmentOutlinedIcon },
            { path: "/reporte_caja", label: "Reporte Caja", icon: AssessmentOutlinedIcon },
        ],
        "Historial": [
            { path: "/historial", label: "Historial", icon: HistoryIcon },
        ],
        "Configuración": [
            { path: "/configuracion_impresion", label: "Impresoras", icon: SettingsOutlinedIcon },
            { path: "/cambiar_clave", label: "Cambiar Contraseña", icon: LockResetOutlinedIcon },
        ],
        "Ayuda": [
            { path: "/documentacion", label: "Documentación de uso", icon: ArticleOutlinedIcon },
            { path: "/comentarios", label: "Enviar Comentarios", icon: FeedbackOutlinedIcon },
        ],
    },
    cajero: {
        "Gestión": [
            { path: "/abm_productos", label: "Productos", icon: RestaurantMenuOutlinedIcon },
            { path: "/stock", label: "Stock", icon: Inventory2OutlinedIcon },
            { path: "/abm_mesas", label: "Mesas", icon: TableRestaurantOutlinedIcon },
            { path: "/abm_categorias", label: "Categorías", icon: CategoryOutlinedIcon },
            { path: "/abm_tipo_envios", label: "Tipos de Envío", icon: DeliveryDiningOutlinedIcon },
            { path: "/abm_planos", label: "Planos", icon: MapOutlinedIcon },
            { path: "/lista_mozos", label: "Listado de Mozos", icon: ChecklistOutlinedIcon },
        ],
        "Operaciones": [
            { path: "/delivery", label: "Delivery", icon: DeliveryDiningOutlinedIcon },
            { path: "/takeaway", label: "Take Away", icon: ShoppingBagOutlinedIcon },
            { path: "/kds", label: "Vista de Cocina", icon: KitchenIcon },
            { path: "/reservas", label: "Reservas", icon: EventNoteOutlinedIcon },
            { path: "/distribucion_mesas", label: "Distribución de las Mesas", icon: AppsOutlinedIcon },
        ],
        "Caja": [
            { path: "/caja", label: "Arqueo", icon: ReceiptOutlinedIcon },
            { path: "/movimiento_caja", label: "Nuevo Movimiento", icon: AddCircleOutlinedIcon },
            { path: "/abm_cuentas_corrientes", label: "Cuentas Corrientes", icon: AccountBalanceWalletOutlinedIcon },
        ],
        "Reportes": [
            { path: "/reporte_resumido", label: "Reporte Resumido", icon: AssessmentOutlinedIcon },
            { path: "/reporte_ventas", label: "Reporte Ventas", icon: AssessmentOutlinedIcon },
            { path: "/reporte_productos", label: "Reporte Productos", icon: AssessmentOutlinedIcon },
            { path: "/reporte_mozos", label: "Reporte Mozos", icon: AssessmentOutlinedIcon },
            { path: "/reporte_mesas", label: "Reporte Mesas", icon: AssessmentOutlinedIcon },
            { path: "/reporte_rentabilidad", label: "Reporte Rentabilidad", icon: AssessmentOutlinedIcon },
            { path: "/reporte_caja", label: "Reporte Caja", icon: AssessmentOutlinedIcon },
        ],
        "Historial": [
            { path: "/historial", label: "Historial", icon: HistoryIcon },
        ],
        "Configuración": [
            { path: "/cambiar_clave", label: "Cambiar Contraseña", icon: LockResetOutlinedIcon },
        ],
        "Ayuda": [
            { path: "/documentacion", label: "Documentación de uso", icon: ArticleOutlinedIcon },
            { path: "/comentarios", label: "Enviar Comentarios", icon: FeedbackOutlinedIcon },
        ],
    },
};

function NavBar_Botones(props) {
    const [showLogout, setShowLogout] = useState(false);
    const [openFolders, setOpenFolders] = useState({});

    const handleFolderToggle = (folderName) => {
        setOpenFolders(prev => ({
            ...prev,
            [folderName]: !prev[folderName]
        }));
    };

    const getFolderIcon = (folderName) => {
        const iconMap = {
            "Gestión": BusinessOutlinedIcon,
            "Operaciones": WorkOutlineOutlinedIcon,
            "Reportes": AssessmentOutlinedIcon,
            "Caja": AccountBalanceWalletOutlinedIcon,
            "Historial": HistoryIcon,
            "Configuración": SettingsOutlinedIcon,
            "Ayuda": HelpOutlineOutlinedIcon,
        };
        return iconMap[folderName] || SettingsOutlinedIcon;
    };

    if (!props.logeadoUsuario) {
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

    const menuSections = menuConfig[props.rol] || {};

    return (
        <Stack spacing={2}>
            <List dense disablePadding>
                {Object.entries(menuSections).map(([folderName, items]) => {
                    const isDirectLink = folderName === "Historial" && items.length === 1;
                    if (isDirectLink) {
                        const { path, label, icon: Icon } = items[0];
                        return (
                            <ListItem disablePadding key={folderName}>
                                <ListItemButton component={Link} to={path}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Icon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={label} />
                                </ListItemButton>
                            </ListItem>
                        );
                    }
                    return (
                        <React.Fragment key={folderName}>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => handleFolderToggle(folderName)}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        {React.createElement(getFolderIcon(folderName), { fontSize: "small" })}
                                    </ListItemIcon>
                                    <ListItemText primary={folderName} />
                                    {openFolders[folderName] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openFolders[folderName]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding dense>
                                    {items.map(({ path, label, icon: Icon }) => (
                                        <ListItem disablePadding key={path}>
                                            <ListItemButton 
                                                component={Link} 
                                                to={path}
                                                sx={{ pl: 4 }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <Icon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    );
                })}
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
