import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { BuscarTodosLosProductos } from '../../../../API/APIProductos';
import { BuscarTodasLasCategorias } from '../../../../API/APICategorias';
import { PostItems } from '../../../../API/APIPedidos';
import { agregarItems as agregarItemsAPedidoActivo } from '../../../../redux/slices/pedidosActivosSlice';
import connection from '../../../../connections/HubConnMozo';

export const useAgregarPedidos = (open, numeroMesa, onClose) => {
    const dispatch = useDispatch();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState(null);
    const [carrito, setCarrito] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cargar productos y categorías
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [productosData, categoriasData] = await Promise.all([
                    BuscarTodosLosProductos(),
                    BuscarTodasLasCategorias()
                ]);
                setProductos(productosData?.filter(p => p.activo) || []);
                setCategorias(categoriasData?.filter(c => c.activo) || []);
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };
        if (open) {
            cargarDatos();
        }
    }, [open]);

    // Filtrar productos
    const productosFiltrados = useMemo(() => {
        let filtrados = productos;

        if (busqueda) {
            filtrados = filtrados.filter(p =>
                p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (categoriaFiltro) {
            filtrados = filtrados.filter(p => {
                if (!p.categorias || !Array.isArray(p.categorias)) return false;
                
                // El backend devuelve categorias como array de strings (nombres)
                // Comparar el nombre de la categoría seleccionada con los nombres en el array
                return p.categorias.includes(categoriaFiltro.nombre);
            });
        }

        return filtrados;
    }, [productos, busqueda, categoriaFiltro]);

    // Calcular total del carrito
    const totalCarrito = useMemo(() => {
        return carrito.reduce((total, item) => {
            return total + (item.producto.precio * item.cantidad);
        }, 0);
    }, [carrito]);

    // Calcular total de items
    const totalItems = useMemo(() => {
        return carrito.reduce((sum, item) => sum + item.cantidad, 0);
    }, [carrito]);

    // Agregar producto al carrito
    const agregarAlCarrito = (producto) => {
        const existe = carrito.find(item => item.producto.id === producto.id);
        if (existe) {
            setCarrito(carrito.map(item =>
                item.producto.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, {
                producto,
                cantidad: 1,
                indicaciones: ''
            }]);
        }
    };

    // Actualizar cantidad en carrito
    const actualizarCantidad = (productoId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            setCarrito(carrito.filter(item => item.producto.id !== productoId));
        } else {
            setCarrito(carrito.map(item =>
                item.producto.id === productoId
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            ));
        }
    };

    // Actualizar indicaciones
    const actualizarIndicaciones = (productoId, indicaciones) => {
        setCarrito(carrito.map(item =>
            item.producto.id === productoId
                ? { ...item, indicaciones }
                : item
        ));
    };

    // Enviar pedidos
    const handleEnviarPedidos = async () => {
        if (carrito.length === 0) return;

        setLoading(true);
        try {
            const itemsParaEnviar = [];
            carrito.forEach(item => {
                for (let i = 0; i < item.cantidad; i++) {
                    itemsParaEnviar.push({
                        id: item.producto.id,
                        indicaciones: item.indicaciones || ''
                    });
                }
            });

            const itemsCreados = await PostItems(itemsParaEnviar, numeroMesa);
            
            if (itemsCreados && itemsCreados.length > 0) {
                const nuevoItems = itemsCreados.map(({ pedidoId, ...resto }) => resto);
                dispatch(agregarItemsAPedidoActivo({ 
                    items: nuevoItems, 
                    numeroMesa: numeroMesa 
                }));

                connection.send("RecargarTicket", numeroMesa);
                setCarrito([]);
                onClose();
            }
        } catch (error) {
            console.error('Error al enviar pedidos:', error);
            alert('Error al agregar los pedidos. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Limpiar estado
    const limpiarEstado = () => {
        setCarrito([]);
        setBusqueda('');
        setCategoriaFiltro(null);
    };

    return {
        // Estado
        productos,
        categorias,
        productosFiltrados,
        carrito,
        busqueda,
        categoriaFiltro,
        loading,
        totalCarrito,
        totalItems,
        
        // Acciones
        setBusqueda,
        setCategoriaFiltro,
        agregarAlCarrito,
        actualizarCantidad,
        actualizarIndicaciones,
        handleEnviarPedidos,
        limpiarEstado
    };
};

