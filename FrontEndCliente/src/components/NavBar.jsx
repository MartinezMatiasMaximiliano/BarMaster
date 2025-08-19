import { useState, useContext } from 'react'
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faReceipt, faBagShopping, faBell } from '@fortawesome/free-solid-svg-icons'
import { CrearNotificacion } from '../Helpers/HelperFunctions'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import connection from '../connections/HubConnCliente';
import { LoginContext, NumeroMesaContext } from '../App.jsx'


function NavBar(props) {
    const [cooldown, setCooldown] = useState(false);
    const [value, setValue] = useState('');
    const logeadoProvider = useContext(LoginContext)
    const NumeroMesaProvider = useContext(NumeroMesaContext)

    const handleLlamarMozo = () => {
        if (cooldown) {
            alert("Por favor, espere antes de intentar nuevamente.");
            return;
        }
        connection.send("EnviarNotificacionAMozos", CrearNotificacion(NumeroMesaProvider.numeroMesa, 'LlamarMozo'))

        alert("Se ha notificado al mozo correctamente.");
        setCooldown(true);
        setTimeout(() => setCooldown(false), 180000); // 3 minutos de cooldown
    };

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99 }} elevation={3}>
            {logeadoProvider.logeado == true ?
                <BottomNavigation
                    showLabels={true}
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                >
                    <BottomNavigationAction label="Menu" value="Menu" icon={<RoomServiceIcon />} component={Link} to={`/menu`} sx={{ width: '100%' }} />
                    <BottomNavigationAction label="Pedido" value="Pedido" icon={<ShoppingCartIcon />} component={Link} to={`/pedido`} />
                    <BottomNavigationAction label="Mi Mesa" value="Mesa" icon={<ReceiptIcon />} component={Link} to={`/mesa`} />
                </BottomNavigation>
                    :
                    <BottomNavigation
                        showLabels={true}
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                    >
                        <BottomNavigationAction label="Ingresar" value="Logear" icon={<ReceiptIcon />} component={Link} to={`/`} />
                    </BottomNavigation>
            }
                </Paper >
    )
}

            export default NavBar;
