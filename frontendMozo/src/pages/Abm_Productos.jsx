import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container } from "react-bootstrap";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearProducto,
    BorrarProducto,
    ActivarProducto,
    DesactivarProducto,
    ModificarProducto,
} from "../API/APIProductos";
import { Campos, inicializarCampos } from "../configs/agregar/Producto"
import { BuscarStock, ConfigurarStock } from "../API/APIStock";
import { agregarConfiguracionStock, crearConfiguracionStockEdicion } from "./productos/configuracionStockProducto";

function Abm_Productos(props) {
    const [campos, setCampos] = useState(Campos);
    const [configuracionesStock, setConfiguracionesStock] = useState([]);
    const productos = useMemo(
        () => agregarConfiguracionStock(props.datos_productos, configuracionesStock),
        [props.datos_productos, configuracionesStock],
    );
    const [filasFiltradas, setFilasFiltradas] = useState(productos);
    const [filasOrdenadas, setFilasOrdenadas] = useState(productos);

    // Inicializar campos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(camposInicializados => {
                setCampos(camposInicializados);
            });
        }
    }, []);

    const cargarConfiguracionesStock = useCallback(async () => {
        try {
            const stock = await BuscarStock();
            setConfiguracionesStock(Array.isArray(stock) ? stock : []);
        } catch (error) {
            console.error('Error al cargar la configuración de stock de los productos:', error);
            setConfiguracionesStock([]);
        }
    }, []);

    useEffect(() => {
        cargarConfiguracionesStock();
    }, [cargarConfiguracionesStock]);

    // Actualizar filas filtradas cuando cambien los datos originales
    useEffect(() => {
        setFilasFiltradas(productos);
        setFilasOrdenadas(productos);
    }, [productos]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const crearProducto = useCallback(async (datos) => {
        const resultado = await CrearProducto(datos);
        await cargarConfiguracionesStock();
        return resultado;
    }, [cargarConfiguracionesStock]);

    const modificarProducto = useCallback(async (datos) => {
        const resultado = await ModificarProducto(datos);
        await ConfigurarStock(datos.id, crearConfiguracionStockEdicion(datos));
        await cargarConfiguracionesStock();
        return resultado;
    }, [cargarConfiguracionesStock]);

    const api = useMemo(() => ({
        crear: crearProducto,
        eliminar: BorrarProducto,
        activar: ActivarProducto,
        desactivar: DesactivarProducto,
        modificar: modificarProducto,
    }), [crearProducto, modificarProducto]);

    const columnas = useMemo(() => ([
        { key: "imagen", label: "", type: "image", align: "right" },
        { key: "codigo", label: "Código", align: "right" },
        { key: "nombre", label: "Nombre", align: "right" },
        { key: "precio", label: "Precio", align: "right" },
        { key: "descripcion", label: "Descripción", align: "right" },
        { key: "categorias", label: "Categorías", align: "right",
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={props.recargarComponentes}
                    showEditar={true}
                    showToggle={() => true}
                    campos={campos}
                />
            ),
        },
    ]), [api, campos, props.recargarComponentes]);

    const opcionesOrdenamiento = useMemo(() => ([
        { label: 'Código', campo: 'codigo', tipoOrden: 'texto' },
        { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
        { label: 'Precio', campo: 'precio', tipoOrden: 'numero' },
        { label: 'Categorías', campo: 'categorias', tipoOrden: 'texto' }
    ]), []);

    const configuracionFiltros = useMemo(() => ({
        codigo: { tipo: 'text' },
        nombre: { tipo: 'text' },
        precio: { tipo: 'number' },
        descripcion: { tipo: 'text' },
        categorias: { tipo: 'text' }
    }), []);

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={filasOrdenadas}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Imagen", "Código", "Nombre", "Precio", "Costo Producción", "Descripción", "Categorias"]}
                        agregar={api.crear}
                        campos={campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={opcionesOrdenamiento}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={productos}
                        columnas={columnas}
                        configuracionFiltros={configuracionFiltros}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_Productos;
