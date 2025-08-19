import './styles/App.css'
import React, { useState, useEffect, createContext } from 'react'
import { Route, Routes, useLocation } from "react-router-dom"
import { Container, Col, Row } from 'react-bootstrap'
import { MappearPersonas, MappearMozos, MappearMesas, MappearMenu, MappearNotificaciones, MappearCategorias, MappearPedidos } from './Helpers/HelperFunctions'
import connection from './connections/HubConnMozo'
import Navbar_Mozo from "./components/NavBar_Mozo";
import Index from './pages/Index';
import Listado_Mozos from './pages/Lista_Mozos';
import Abm_Mesas from './pages/Abm_Mesas';
import Abm_Menu from './pages/Abm_Menu';
import Abm_Categorias from './pages/Abm_Categorias'
import Abm_Personas from './pages/Abm_Personas'
import Auditoria_Caja from './pages/Auditoria_Caja'
import Cambiar_Clave from './pages/Cambiar_Clave'
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

export const LoginContext = createContext();

function App() {

    const location = useLocation();

    const dispatch = useDispatch();

    // State de login

    const [logeado, setLogeado] = useState(false);

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

    useEffect(() => {
        connection.on("RegistrarProducto", (pedido, numeroMesa) => { AgregarItemsAPedido(pedido, numeroMesa) })
        connection.on("RegistrarNotificacion", (notificacion) => { dispatch(agregarNotificaciones(notificacion)) })
        connection.on("PagarMesa", (IdPedido) => { pagarTotal(IdPedido) })
        connection.on("PagarMesaSeparado", (ArrayIdsItems) => { pagarSeparado(ArrayIdsItems)})
    }, [])

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
            connection.send("RecargarTicket", numeroMesa);
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

    return (
        <>
            <LoginContext.Provider value={{ logeado, setLogeado }}>
                <Container fluid>
                    <Row>
                        <Col xs={3} md={2}>
                            <Navbar_Mozo></Navbar_Mozo>
                        </Col>
                        <Col xs={6} md={8} className="mt-2">
                            <Routes>
                                <Route path="/" element={<Index mesas={mesas} datos_mozos={datos_mozos_listado} />} />
                                <Route path="/abm_categorias" element={<Abm_Categorias recargarComponentes={recargarCategorias} datos_categorias={categorias} titulo="Categorias" />} />
                                <Route path="/lista_mozos" element={<Listado_Mozos datos_mozos={datos_mozos_listado} titulo="Mozos" />} />
                                <Route path="/abm_mesas" element={<Abm_Mesas recargarComponentes={recargarMesas} datos_mesas={datos_mesas_abm} datos_select={datos_mozos_listado} titulo="Mesas" />} />
                                <Route path="/abm_menu" element={<Abm_Menu recargarComponentes={recargarProductos} datos_menu={datos_menu_abm} categorias={categorias} titulo="Menu" />} />
                                <Route path="/abm_personas" element={<Abm_Personas recargarComponentes={recargarPersonas} datos_personas={datos_personas_abm} datos_select={roles} titulo="Personas" />} />
                                <Route path="/auditoria_caja" element={<Auditoria_Caja datos_pedidos={datos_pedidos} titulo="Caja"></Auditoria_Caja>} />
                                <Route path="/cambiar_clave" element={<Cambiar_Clave />} />
                                <Route path="/login" element={<Login />} />
                            </Routes>
                        </Col>
                        <Col xs={3} md={2} className="container-notificaciones">
                            {Notificaciones.reverse()}
                        </Col>
                    </Row>
                </Container>
            </LoginContext.Provider>
        </>
    )
}

export default App

