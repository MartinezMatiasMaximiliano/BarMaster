import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BuscarTodosLosProductos } from '../../../../API/APIProductos';
import { BuscarTodasLasCategorias } from '../../../../API/APICategorias';
import { AgregarProductosAVisita } from '../../../../API/APIVisitas';
import { agregarProductos } from '../../../../redux/slices/visitasActivasSlice';
import connection from '../../../../connections/HubConnMozo';

export const useAgregarPedidos = (open, idVisita, numeroMesa, onClose) => {
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

    // Agregar producto al carrito (useCallback estable para evitar re-renders de ListaProductos)
    const agregarAlCarrito = useCallback((producto) => {
        setCarrito((prev) => {
            const existe = prev.find(item => item.producto.id === producto.id);
            if (existe) {
                return prev.map(item =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prev, { producto, cantidad: 1, indicaciones: '' }];
        });
    }, []);

    // Actualizar cantidad en carrito
    const actualizarCantidad = useCallback((productoId, nuevaCantidad) => {
        setCarrito((prev) => {
            if (nuevaCantidad <= 0) {
                return prev.filter(item => item.producto.id !== productoId);
            }
            return prev.map(item =>
                item.producto.id === productoId
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            );
        });
    }, []);

    // Actualizar indicaciones
    const actualizarIndicaciones = useCallback((productoId, indicaciones) => {
        setCarrito((prev) =>
            prev.map(item =>
                item.producto.id === productoId
                    ? { ...item, indicaciones }
                    : item
            )
        );
    }, []);

    // Enviar pedidos
    const handleEnviarPedidos = async () => {
        if (carrito.length === 0 || !idVisita) return;

        setLoading(true);
        try {
            const itemsParaEnviar = [];
            carrito.forEach(item => {
                // Agregar cada producto con su cantidad
                itemsParaEnviar.push({
                    id: item.producto.id,
                    indicaciones: item.indicaciones || '',
                    cantidad: item.cantidad
                });
            });

            const visitaActualizada = await AgregarProductosAVisita(idVisita, itemsParaEnviar);
            
            if (visitaActualizada && visitaActualizada.productos) {
                // Mapear los productos de la respuesta al formato esperado por Redux
                // El backend devuelve ProductosPorVisita con propiedades en PascalCase
                const productosLimpios = visitaActualizada.productos.map(producto => ({
                    id: producto.id || producto.Id,
                    nombre: producto.nombreProducto || producto.NombreProducto || producto.nombre || producto.Nombre,
                    precio: producto.precioDelMomento || producto.PrecioDelMomento || producto.precio || producto.Precio,
                    indicaciones: producto.detalles || producto.Detalles || producto.indicaciones || producto.Indicaciones || '',
                    estadoPagado: producto.estadoPagado || producto.EstadoPagado || false
                }));

                dispatch(agregarProductos({ 
                    productos: productosLimpios, 
                    numeroMesa: numeroMesa 
                }));

                connection.send("RecargarTicket", numeroMesa);
                setCarrito([]);
                onClose();
            } else {
                // Si no hay productos en la respuesta, al menos cerrar el modal
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

