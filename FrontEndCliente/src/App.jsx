import { useState, useEffect, createContext } from 'react'
import Button from '@mui/material/Button'
import { Route, Routes, useNavigate } from "react-router-dom"
import Menu from "./pages/Menu"
import NavBar from './components/NavBar';
import TopBar from './components/TopBar';
import Pedido from "./pages/Pedido"
import Mesa from "./pages/Mesa"
import Login from './pages/Login';
import Gracias from './pages/Gracias';
import connection from './connections/HubConnCliente'
import { obtenerFechaActual, CrearNotificacion } from './Helpers/HelperFunctions'
import 'bootstrap/dist/css/bootstrap.min.css'
import { theme } from './styles/theme'
import { ThemeProvider } from '@mui/material/styles'

export const LoginContext = createContext();
export const PedidoContext = createContext();
export const NumeroMesaContext = createContext();

function App() {
    const [logeado, setLogeado] = useState(false);
    const [numeroMesa, setNumeroMesa] = useState(-1);
    const [pedido, setPedido] = useState([]);
    const [key, setKey] = useState(0);
    const [KeyMenu, SetKeyMenu] = useState(0);
    const navigate = useNavigate();

    connection.on("RecargarTicket", (numeroMesa) => RecargarComponente(numeroMesa));
    connection.on("RecargarMenu", () => RecargarMenu());
    connection.on("MesaCerrada", (numeroMesa) => CerrarSesion(numeroMesa));

    function CerrarSesion(numMesa) {
        if (numMesa === numeroMesa) {
            setPedido([]);
            setLogeado(false);
            setNumeroMesa(-1);
            navigate('/gracias');
        }
    }

    function RecargarComponente(numMesa) {
        if (numMesa === numeroMesa) {
            setKey(prevKey => prevKey + 1);
        }
    }

    function RecargarMenu() {
        SetKeyMenu(prevKey => prevKey + 1);
    }

    return (
        <ThemeProvider theme={theme}>
            <LoginContext.Provider value={{ logeado, setLogeado }}>
                <NumeroMesaContext.Provider value={{ numeroMesa, setNumeroMesa }}>
                    <PedidoContext.Provider value={{ pedido, setPedido }}>
                        <TopBar></TopBar>
                        <Routes>
                            <Route path="" element={<Login />} />
                            <Route path="/gracias" element={<Gracias />} />
                            <Route path="/menu" element={<Menu key={KeyMenu} />} />
                            <Route path="/pedido" element={<Pedido />} />
                            <Route path="/mesa" element={<Mesa key={key} />} />
                        </Routes>
                        <NavBar></NavBar>
                    </PedidoContext.Provider>
                </NumeroMesaContext.Provider>
            </LoginContext.Provider>
        </ThemeProvider>

    )
}

export default App;
