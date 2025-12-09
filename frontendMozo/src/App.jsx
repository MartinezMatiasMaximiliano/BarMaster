import './styles/App.css'
import React, { useState, useEffect, createContext } from 'react'
import { Route, Routes, useLocation } from "react-router-dom"
import { Box } from '@mui/material'
import { MappearPersonas, MappearMozos, MappearMesas, MappearMenu, MappearNotificaciones, MappearPedidos } from './Helpers/HelperFunctions'
import useSignalR from './hooks/useSignalR'
import Navbar from "./components/NavBar/NavBar";
import Index from './pages/Index';
import Index2 from './pages/Index2';
import Listado_Mozos from './pages/Lista_Mozos';
import Abm_Mesas from './pages/Abm_Mesas';
import Abm_Menu from './pages/Abm_Menu';
import Abm_Categorias from './pages/Abm_Categorias'
import Abm_Personas from './pages/Abm_Personas'
import Graficas from './pages/Graficas'
import Cambiar_Clave from './pages/Cambiar_Clave'
import Distribucion_mesas from './pages/Distribucion_mesas'
import Delivery_TakeAway from './pages/Delivery_TakeAway'
import Caja from './pages/Caja/Caja'
import Mi_Plan from './pages/Mi_Plan'
import Login from './pages/Login';
import { PostItems } from './API/APIPedidos';
import { BuscarTodasLasMesas } from './API/APIMesas';
import { BuscarTodosLosProductos } from './API/APIProductos';
import { BuscarTodasLasCategorias } from './API/APICategorias';
import { BuscarTodosLosMozos } from './API/APIPersonas'
import { BuscarTodasLasPersonas } from './API/APIPersonas'
import { BuscarTodosLosRoles } from './API/APIRoles'
import { BuscarTodosLosPedidos, BuscarUnPedido } from './API/APIPedidos'
import { CambiarEstadoItems } from './API/APIItems'
import { useSelector, useDispatch } from 'react-redux'
import { agregarItems as agregarItemsAPedidoActivo, crear as crearPedidosActivos, cambiarEstadoItems } from './redux/slices/pedidosActivosSlice'
import { agregar as agregarNotificaciones } from './redux/slices/notificacionesSlice'
import { agregar as agregarTicket } from './redux/slices/ticketSlice'
import Control_Login from './components/Control_Login';

export const LoginContext = createContext();

function App() {

    const location = useLocation();

    const dispatch = useDispatch();

    // State de login

    const [logeado, setLogeado] = useState(false);
    const [rol, setRol] = useState(localStorage.getItem('rol') || '');

    // States que usan redux
    const pedidosActivos = useSelector((state) => state.pedidosActivos.value); 
    const notificaciones = useSelector((state) => state.notificaciones.value); 

    // States que se llenan con llamados a la DB y su valor es constante
    const [categorias, SetCategorias] = useState([])
    const [mesas, SetMesas] = useState([])
    const [mozos, SetMozos] = useState([])
    const [menu, SetMenu] = useState([])
    const [personas, SetPersonas] = useState([])
    const [roles, SetRoles] = useState([])
    const [pedidos, SetPedidos] = useState([])

    // Cada vez que se hace un navigate('/?algo'), se ejecuta este useEffect recargando los componentes
    // Es mucho más rápido que usar window.location.reload() al abrir/cerrar mesa

    useEffect(() => {
        if (location.pathname === '/') {
            BuscarTodasLasMesas().then(data => SetMesas(data))
            BuscarTodosLosMozos().then(data => SetMozos(data))
            BuscarTodosLosProductos().then(data => SetMenu(data))
            BuscarTodasLasPersonas().then(data => SetPersonas(data))
            BuscarTodosLosRoles().then(data => SetRoles(data))
            BuscarTodosLosPedidos().then(data => SetPedidos(data))
            BuscarTodasLasCategorias().then(data => SetCategorias(data));
        }
        
    }, [location.search, location.pathname])

    const { sendRecargarTicket } = useSignalR({
        onRegistrarProducto: (pedido, numeroMesa) => { AgregarItemsAPedido(pedido, numeroMesa) },
        onRegistrarNotificacion: (notificacion) => { dispatch(agregarNotificaciones(notificacion)) },
        onPagarMesa: (IdPedido) => { pagarTotal(IdPedido) },
        onPagarMesaSeparado: (ArrayIdsItems) => { pagarSeparado(ArrayIdsItems) }
    })

    useEffect(() => {
        if (pedidos.length > 0) {
            dispatch(crearPedidosActivos(pedidos.filter(pedido => pedido.activo)));
        }
    }, [pedidos]);

    async function recargarMesas() {
        await BuscarTodasLasMesas().then(data => SetMesas(data));
    }

    async function recargarProductos() {
        await BuscarTodosLosProductos().then(data => SetMenu(data));
    }

    async function recargarPersonas() {
        await BuscarTodasLasPersonas().then(data => SetPersonas(data));
    }

    async function recargarCategorias() {
        await BuscarTodasLasCategorias().then(data => SetCategorias(data));
    }

    //TODO: Recargar Delivery/Take Away
    async function recargarDeliveryTakeAway() {
        //await BuscarTodosLosDeliveryTakeAway().then(data => SetDeliveryTakeAway(data));
    }

    async function recargarListadoMozos() {
        await BuscarTodosLosMozos().then(data => SetMozos(data));
    }

    async function pagarTotal(IdPedido) {

        const pedido = await BuscarUnPedido(IdPedido);

        if (pedido) {
            const ListaItems = pedido.items.filter(item => item.estado === 0).map(item => item.id);

            // Hacer la actualización en la base de datos
            CambiarEstadoItems(ListaItems, "Procesando");

            // Agrego el ticket
            dispatch(agregarTicket(ListaItems));

            // Actualizar el estado en Redux
            dispatch(cambiarEstadoItems({ idsItems: ListaItems, estadoNuevo: 1 }));
        }
    }

    function pagarSeparado(ArrayIdsItems) {
        console.log("ARRAYIDSITEMS", ArrayIdsItems);
        // Hago los cambios en la DB
        CambiarEstadoItems(ArrayIdsItems, "Procesando");

        // Agrego el ticket

        dispatch(agregarTicket(ArrayIdsItems));

        // Actualizo el estado
        dispatch(cambiarEstadoItems({ idsItems: ArrayIdsItems, estadoNuevo: 1 }));
    };

    async function AgregarItemsAPedido(Pedido, numeroMesa) {

        try {
            const items = await PostItems(Pedido, numeroMesa);
            const nuevoItems = items.map(({ pedidoId, ...resto }) => resto);
            dispatch(agregarItemsAPedidoActivo({ items: nuevoItems, numeroMesa: numeroMesa }));
            sendRecargarTicket(numeroMesa);
        } catch (error) {
            console.log(error);
        }
    }

    const datos_mozos_listado = MappearMozos(mozos)
    const datos_personas_abm = MappearPersonas(personas)
    const datos_mesas_abm = MappearMesas(mesas)
    const datos_menu_abm = MappearMenu(menu)
    const Notificaciones = MappearNotificaciones(notificaciones)
    const datos_pedidos = MappearPedidos(pedidos)

    console.log("MESAS: ", datos_mesas_abm);

    return (
        <LoginContext.Provider value={{ logeado, setLogeado, rol, setRol }}>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    bgcolor: 'background.default'
                }}
            >
                <Box
                    component="aside"
                    sx={{
                        width: { xs: 220, md: 260 },
                        borderRight: 1,
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 0,
                        alignSelf: 'flex-start',
                        minHeight: '100vh',
                        bgcolor: 'background.paper'
                    }}
                >
                    <Navbar />
                </Box>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        px: { xs: 2, md: 4 },
                        py: 2,
                        overflowX: 'hidden'
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Index mesas={mesas} datos_mozos={datos_mozos_listado} />} />
                        <Route path="/Index2" element={<Index2 mesas={mesas} datos_mozos={datos_mozos_listado} />} />
                        <Route path="/caja" element={<Control_Login><Caja /></Control_Login>} />
                        <Route path="/abm_categorias" element={<Control_Login><Abm_Categorias recargarComponentes={recargarCategorias} datos_categorias={categorias} titulo="Categorias" /></Control_Login>} />
                        <Route path="/lista_mozos" element={<Control_Login><Listado_Mozos recargarComponentes={recargarListadoMozos} datos_mozos={datos_mozos_listado} titulo="Mozos" /></Control_Login>} />
                        <Route path="/abm_mesas" element={<Control_Login><Abm_Mesas recargarComponentes={recargarMesas} datos_mesas={datos_mesas_abm} datos_select={datos_mozos_listado} titulo="Mesas" /></Control_Login>} />
                        <Route path="/abm_menu" element={<Control_Login><Abm_Menu recargarComponentes={recargarProductos} datos_menu={datos_menu_abm} categorias={categorias} titulo="Menu" /></Control_Login>} />
                        <Route path="/abm_personas" element={<Control_Login><Abm_Personas recargarComponentes={recargarPersonas} datos_personas={datos_personas_abm} datos_select={roles} titulo="Personas" /></Control_Login>} />
                        <Route path="/graficas" element={<Control_Login><Graficas datos_pedidos={datos_pedidos} titulo="Caja"></Graficas></Control_Login>} />
                        <Route path="/distribucion_mesas" element={<Control_Login><Distribucion_mesas /></Control_Login>} />
                        <Route path="/delivery_takeaway" element={<Control_Login><Delivery_TakeAway recargarComponentes={recargarDeliveryTakeAway} titulo="Delivery/Take Away" /></Control_Login>} />
                        <Route path="/cambiar_clave" element={<Control_Login><Cambiar_Clave /></Control_Login>} />
                        <Route path="/mi_plan" element={<Control_Login><Mi_Plan /></Control_Login>} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </Box>
                <Box
                    component="aside"
                    sx={{
                        width: { xs: 0, md: 260 },
                        borderLeft: { md: 1 },
                        borderColor: 'divider',
                        display: { xs: 'none', md: 'block' },
                        bgcolor: 'background.paper',
                        px: 2,
                        py: 3
                    }}
                    className="container-notificaciones"
                >
                    {Notificaciones.reverse()}
                </Box>
            </Box>
        </LoginContext.Provider>
    )
}

export default App

