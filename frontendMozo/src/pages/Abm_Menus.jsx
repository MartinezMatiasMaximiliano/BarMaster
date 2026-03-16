import React, { useState, useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Stack, IconButton, Chip, Alert, Box } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { 
    CrearMenu, 
    BorrarMenu, 
    ActivarMenu, 
    DesactivarMenu, 
    ModificarMenu 
} from "../API/APIMenus";
import { authService } from "../services/authService";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { Campos } from "../configs/agregar/Menus";
import Modal_GestionarProductosMenu from "../components/Modals/Gestionar_Productos_Menu/Modal_GestionarProductosMenu";

function Abm_Menus(props) {
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [menuSeleccionado, setMenuSeleccionado] = useState(null);
    const [mostrarModalProductos, setMostrarModalProductos] = useState(false);

    // Mapear datos de menús al formato esperado
    // El endpoint devuelve: { id, nombre, activo, productos }
    const mapearMenus = (menus) => {
        if (!menus || !Array.isArray(menus)) return [];
        return menus.map(menu => ({
            id: menu.id,
            nombre: menu.nombre,
            activo: menu.activo,
            cantidadProductos: (menu.productos || []).length,
            productos: menu.productos || []
        }));
    };

    // Mapear menús una sola vez cuando cambien los datos
    const menusMapeados = useMemo(() => {
        return mapearMenus(props.datos_menus || []);
    }, [props.datos_menus]);

    // Actualizar filas cuando cambien los datos
    useEffect(() => {
        setFilasFiltradas(menusMapeados);
        setFilasOrdenadas(menusMapeados);
    }, [menusMapeados]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    // Wrapper para CrearMenu que incluye IdSucursal
    const crearMenuConSucursal = async (datos) => {
        // Intentar obtener IdSucursal de props, localStorage, o del token JWT
        let idSucursal = props.idSucursal || localStorage.getItem('idSucursal');
        
        // Si no está en props ni localStorage, extraerlo del token JWT
        if (!idSucursal) {
            idSucursal = authService.getIdSucursal();
        }
        
        if (!idSucursal) {
            throw new Error('No se pudo obtener la sucursal. Por favor, inicie sesión nuevamente.');
        }
        
        return await CrearMenu({
            ...datos,
            idSucursal: idSucursal
        });
    };

    const api = {
        crear: crearMenuConSucursal,
        eliminar: BorrarMenu,
        activar: (id) => ActivarMenu(id, true),
        desactivar: (id) => DesactivarMenu(id),
        modificar: ModificarMenu,
    };

    const columnas = useMemo(() => [
        { key: "nombre", label: "Nombre", align: "right" },
        { 
            key: "cantidadProductos", 
            label: "Productos", 
            align: "right",
            render: (fila) => (
                <Chip 
                    label={`${fila.cantidadProductos} producto${fila.cantidadProductos !== 1 ? 's' : ''}`}
                    size="small"
                    color={fila.cantidadProductos > 0 ? "primary" : "default"}
                    variant="outlined"
                />
            )
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => {
                            setMenuSeleccionado(fila);
                            setMostrarModalProductos(true);
                        }}
                        title="Gestionar productos"
                    >
                        <RestaurantMenuIcon fontSize="small" />
                    </IconButton>
                    <Fila_Acciones
                        fila={fila}
                        api={api}
                        recargar={props.recargarComponentes}
                        showEditar={true}
                        showToggle={() => true}
                        campos={Campos}
                    />
                </Stack>
            ),
        },
    ], [props.recargarComponentes]);

    return (
        <Container>
            <Alert severity="info" sx={{ mb: 2 }}>
                Para agregar un menú use el botón <strong>+</strong>. Para editar un menú use el lápiz. Clickeando el ícono <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', mx: 0.25 }}><RestaurantMenuIcon fontSize="small" /></Box> puede agregar y quitar productos de un menú.
            </Alert>
            <Tabla
                titulo={props.titulo}
                filas={filasOrdenadas}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        agregar={api.crear}
                        campos={Campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={[
                            { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
                            { label: 'Cantidad de productos', campo: 'cantidadProductos', tipoOrden: 'numero' }
                        ]}
                        onOrdenar={setFilasOrdenadas}
                        key={filasFiltradas.length}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={menusMapeados}
                        columnas={columnas}
                        configuracionFiltros={{
                            nombre: { tipo: 'text' }
                        }}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
            <Modal_GestionarProductosMenu 
                open={mostrarModalProductos}
                onClose={() => {
                    setMostrarModalProductos(false);
                    setMenuSeleccionado(null);
                }}
                menu={menuSeleccionado}
                productos={props.productos || []}
                recargar={props.recargarComponentes}
            />
        </Container>
    );
}

export default Abm_Menus;
