import './styles/App.css'
import React, { useState, useEffect, createContext } from 'react'
import { Route, Routes, useLocation, Navigate } from "react-router-dom"
import { Box } from '@mui/material'
import { MappearPersonas, MappearMozos, MappearMesas, MappearMenu, MappearNotificaciones, MappearPedidos, MappearReservas } from './Helpers/HelperFunctions'
import useSignalR from './hooks/useSignalR'
import Navbar from "./components/NavBar/NavBar";
import Index from './pages/Index/Index';
import Index2 from './pages/Index2';
import Listado_Mozos from './pages/Lista_Mozos';
import Abm_Mesas from './pages/Abm_Mesas';
import Abm_Menu from './pages/Abm_Menu';
import Abm_Categorias from './pages/Abm_Categorias'
import Abm_Personas from './pages/Abm_Personas'
import Abm_TipoPago from './pages/Abm_TipoPago'
import Graficas from './pages/Graficas'
import Cambiar_Clave from './pages/Cambiar_Clave'
import Distribucion_mesas from './pages/Distribucion_mesas'
import Delivery from './pages/Delivery'
import TakeAway from './pages/TakeAway'
import Abm_Reservas from './pages/Abm_Reservas'
import Caja from './pages/Caja/Caja'
import KDS from './pages/KDS/KDS'
import Mi_Plan from './pages/Mi_Plan'
import Reportes from './pages/Reportes/Reportes'
import ReporteVentas from './pages/Reportes/ReporteVentas'
import ReporteProductos from './pages/Reportes/ReporteProductos'
import ReporteMozos from './pages/Reportes/ReporteMozos'
import ReporteMesas from './pages/Reportes/ReporteMesas'
import ReporteRentabilidad from './pages/Reportes/ReporteRentabilidad'
import ReporteCaja from './pages/Reportes/ReporteCaja'
import ReporteResumido from './pages/Reportes/ReporteResumido'
import PanelSucursales from './pages/panel_sucursales/Panel_Sucursales'
import DetalleSucursal from './pages/Detalle_Sucursal'
import LoginUsuarios from './pages/Login_Usuarios';
import LoginEmpresaSucursal from './pages/Login_Empresa_Sucursal';
import { PostItems } from './API/APIPedidos';
import { BuscarTodasLasMesas } from './API/APIMesas';
import { BuscarTodosLosProductos } from './API/APIProductos';
import { BuscarTodasLasCategorias } from './API/APICategorias';
import { BuscarTodosLosMozos } from './API/APIPersonas'
import { BuscarTodasLasPersonas } from './API/APIPersonas'
import { BuscarTodosLosRoles } from './API/APIRoles'
import { BuscarTodosLosPedidos, BuscarUnPedido } from './API/APIPedidos'
import { BuscarTodasLasReservas } from './API/APIReservas'
import { BuscarTodosLosTipoPagos } from './API/APITipoPagos'
import { CambiarEstadoItems } from './API/APIItems'
import { useSelector, useDispatch } from 'react-redux'
import { agregarItems as agregarItemsAPedidoActivo, crear as crearPedidosActivos, cambiarEstadoItems } from './redux/slices/pedidosActivosSlice'
import { agregar as agregarNotificaciones } from './redux/slices/notificacionesSlice'
import { agregar as agregarTicket } from './redux/slices/ticketSlice'
import Control_Login from './components/Control_Login';

export const LoginContext = createContext();
export const SucursalContext = createContext();
export const AuthTypeContext = createContext();

function App() {
    const location = useLocation();

    const dispatch = useDispatch();

    // State de login - Si no hay token o auth_type, no está logeado
    const [logeadoEmpresaSucursal, setLogeadoEmpresaSucursal] = useState(() => {
        const token = localStorage.getItem('token');
        const authType = localStorage.getItem('auth_type');
        return !!(token && authType); // Solo está logeado si hay token Y auth_type
    });

    const [logeadoUsuario, setLogeadoUsuario] = useState(false);

    const [rol, setRol] = useState(localStorage.getItem('rol') || '');
    const [authType, setAuthType] = useState(() => {
        return localStorage.getItem('auth_type') || null;
    });

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
    const [reservas, SetReservas] = useState([])
    const [tipoPagos, SetTipoPagos] = useState([])

    // Cada vez que se hace un navigate('/?algo'), se ejecuta este useEffect recargando los componentes
    // Es mucho más rápido que usar window.location.reload() al abrir/cerrar mesa

    useEffect(() => {
        if (location.pathname === '/sistema_sucursal') {
            if (localStorage.getItem('token')) {
                BuscarTodasLasMesas()
                    .then(data => SetMesas(Array.isArray(data) ? data : []))
                    .catch(() => SetMesas([]));
                BuscarTodosLosMozos()
                    .then(data => SetMozos(Array.isArray(data) ? data : []))
                    .catch(() => SetMozos([]));
                BuscarTodosLosProductos()
                    .then(data => SetMenu(Array.isArray(data) ? data : []))
                    .catch(() => SetMenu([]));
                BuscarTodasLasPersonas()
                    .then(data => SetPersonas(Array.isArray(data) ? data : []))
                    .catch(() => SetPersonas([]));
                BuscarTodosLosRoles()
                    .then(data => SetRoles(Array.isArray(data) ? data : []))
                    .catch(() => SetRoles([]));
                BuscarTodosLosPedidos()
                    .then(data => SetPedidos(Array.isArray(data) ? data : []))
                    .catch(() => SetPedidos([]));
                BuscarTodasLasCategorias()
                    .then(data => SetCategorias(Array.isArray(data) ? data : []))
                    .catch(() => SetCategorias([]));    
                BuscarTodasLasReservas()
                    .then(data => SetReservas(Array.isArray(data) ? data : []))
                    .catch(() => SetReservas([]));
                BuscarTodosLosTipoPagos()
                    .then(data => SetTipoPagos(Array.isArray(data) ? data : []))
                    .catch(() => SetTipoPagos([]));
            } else {
                // Si no hay sucursal activa, limpiar datos
                SetMesas([]);
                SetMozos([]);
                SetMenu([]);
                SetPersonas([]);
                SetRoles([]);
                SetPedidos([]);
                SetCategorias([]);
                SetReservas([]);
                SetTipoPagos([]);
            }
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

    async function recargarReservas() {
        await BuscarTodasLasReservas().then(data => SetReservas(data));
    }

    async function recargarTipoPagos() {
        await BuscarTodosLosTipoPagos().then(data => SetTipoPagos(data));
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
        }
    }

    const datos_mozos_listado = MappearMozos(mozos || [])
    const datos_personas_abm = MappearPersonas(personas || [])
    const datos_mesas_abm = MappearMesas(mesas || [])
    const datos_menu_abm = MappearMenu(menu || [])
    const Notificaciones = MappearNotificaciones(notificaciones || [])
    const datos_pedidos = MappearPedidos(pedidos || [])
    const datos_reservas = MappearReservas(reservas || [])

    console.log("DATOS RESERVAS: ", reservas)
    console.log("DATOS RESERVAS MAP: ", datos_reservas)

    // Si no está logeado, mostrar SOLO el login, sin ningún layout adicional
    if (!logeadoEmpresaSucursal) {
        return (
            <LoginContext.Provider value={{ logeadoEmpresaSucursal, setLogeadoEmpresaSucursal, rol, setRol }}>
                <AuthTypeContext.Provider value={{ authType, setAuthType }}>
                    <Routes>
                        <Route path="/" element={<LoginEmpresaSucursal />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthTypeContext.Provider>
            </LoginContext.Provider>
        );
    }

    // Si está logeado como empresa, mostrar solo el panel de sucursales
    if (authType === 'empresa') {
        return (
            <LoginContext.Provider value={{ logeadoEmpresaSucursal, setLogeadoEmpresaSucursal, rol, setRol }}>
                <AuthTypeContext.Provider value={{ authType, setAuthType }}>
                    <Box
                        sx={{
                            minHeight: '100vh',
                            bgcolor: 'background.default',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            py: 4
                        }}
                    >
                        <Box
                            sx={{
                                width: '70%',
                                maxWidth: '1400px',
                                minWidth: '600px'
                            }}
                        >
                            <Routes>
                                <Route path="/panel_sucursales" element={<PanelSucursales />} />
                                <Route path="/sucursal/:idEmpresa/:idSucursal" element={<DetalleSucursal />} />
                                <Route path="*" element={<Navigate to="/panel_sucursales" replace />} />
                            </Routes>
                        </Box>
                    </Box>
                </AuthTypeContext.Provider>
            </LoginContext.Provider>
        );
    }

    // Si está logeado como sucursal, mostrar el sistema operacional completo
    return (
        <LoginContext.Provider value={{ logeadoUsuario, setLogeadoUsuario, rol, setRol }}>
            <AuthTypeContext.Provider value={{ authType, setAuthType }}>
                <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                    <Box component="aside" sx={{ width: { xs: 220, md: 260 }, borderRight: 1, borderColor: 'divider', position: 'sticky', top: 0, alignSelf: 'flex-start', minHeight: '100vh', bgcolor: 'background.paper' }}>
                        <Navbar />
                    </Box>
                    <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, md: 4 }, py: 2, overflowX: 'hidden' }}>
                        <Routes>
                            <Route path="/sistema_sucursal" element={<Index mesas={mesas} datos_mozos={datos_mozos_listado} />} />
                            <Route path="/Index2" element={<Index2 mesas={mesas} datos_mozos={datos_mozos_listado} />} />
                            <Route path="/caja" element={<Control_Login><Caja /></Control_Login>} />
                            <Route path="/abm_categorias" element={<Control_Login><Abm_Categorias recargarComponentes={recargarCategorias} datos_categorias={categorias} titulo="Categorias" /></Control_Login>} />
                            <Route path="/lista_mozos" element={<Control_Login><Listado_Mozos recargarComponentes={recargarListadoMozos} datos_mozos={datos_mozos_listado} titulo="Mozos" /></Control_Login>} />
                            <Route path="/abm_mesas" element={<Control_Login><Abm_Mesas recargarComponentes={recargarMesas} datos_mesas={datos_mesas_abm} datos_select={datos_mozos_listado} titulo="Mesas" /></Control_Login>} />
                            <Route path="/abm_menu" element={<Control_Login><Abm_Menu recargarComponentes={recargarProductos} datos_menu={datos_menu_abm} categorias={categorias} titulo="Menu" /></Control_Login>} />
                            <Route path="/abm_personas" element={<Control_Login><Abm_Personas recargarComponentes={recargarPersonas} datos_personas={datos_personas_abm} datos_select={roles} titulo="Personas" /></Control_Login>} />
                            <Route path="/abm_tipo_pago" element={<Control_Login><Abm_TipoPago recargarComponentes={recargarTipoPagos} datos_tipo_pagos={tipoPagos} titulo="Tipos de Pago" /></Control_Login>} />
                            <Route path="/reservas" element={<Control_Login><Abm_Reservas recargarComponentes={recargarReservas} datos_reservas={datos_reservas} titulo="Reservas" /></Control_Login>} />
                            <Route path="/graficas" element={<Control_Login><Graficas datos_pedidos={datos_pedidos} titulo="Caja"></Graficas></Control_Login>} />
                            <Route path="/reportes" element={<Control_Login><Reportes /></Control_Login>} />
                            <Route path="/reporte_ventas" element={<Control_Login><ReporteVentas /></Control_Login>} />
                            <Route path="/reporte_productos" element={<Control_Login><ReporteProductos /></Control_Login>} />
                            <Route path="/reporte_mozos" element={<Control_Login><ReporteMozos /></Control_Login>} />
                            <Route path="/reporte_mesas" element={<Control_Login><ReporteMesas /></Control_Login>} />
                            <Route path="/reporte_rentabilidad" element={<Control_Login><ReporteRentabilidad /></Control_Login>} />
                            <Route path="/reporte_caja" element={<Control_Login><ReporteCaja /></Control_Login>} />
                            <Route path="/reporte_resumido" element={<Control_Login><ReporteResumido /></Control_Login>} />
                            <Route path="/distribucion_mesas" element={<Control_Login><Distribucion_mesas /></Control_Login>} />
                            <Route path="/delivery" element={<Control_Login><Delivery recargarComponentes={recargarDeliveryTakeAway} titulo="Delivery" /></Control_Login>} />
                            <Route path="/takeaway" element={<Control_Login><TakeAway recargarComponentes={recargarDeliveryTakeAway} titulo="Take Away" /></Control_Login>} />
                            <Route path="/kds" element={<Control_Login><KDS /></Control_Login>} />
                            <Route path="/cambiar_clave" element={<Control_Login><Cambiar_Clave /></Control_Login>} />
                            <Route path="/mi_plan" element={<Control_Login><Mi_Plan /></Control_Login>} />
                            <Route path="/panel_sucursales" element={<Control_Login><PanelSucursales /></Control_Login>} />
                            <Route path="/sucursal/:idEmpresa/:idSucursal" element={<Control_Login><DetalleSucursal /></Control_Login>} />
                            <Route path="/login" element={<LoginUsuarios />} />
                            <Route path="*" element={<Navigate to="/sistema_sucursal" replace />} />
                        </Routes>
                    </Box>
                    <Box component="aside" sx={{ width: { xs: 0, md: 260 }, borderLeft: { md: 1 }, borderColor: 'divider', display: { xs: 'none', md: 'block' }, bgcolor: 'background.paper', px: 2, py: 3 }} className="container-notificaciones">
                        {Notificaciones.reverse()}
                    </Box>
                </Box>
            </AuthTypeContext.Provider>
        </LoginContext.Provider>
    )
}

export default App
