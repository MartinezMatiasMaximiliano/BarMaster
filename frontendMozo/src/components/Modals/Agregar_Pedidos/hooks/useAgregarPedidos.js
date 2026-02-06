import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BuscarTodosLosProductos } from '../../../../API/APIProductos';
import { BuscarTodasLasCategorias } from '../../../../API/APICategorias';
import { AgregarProductosAVisita } from '../../../../API/APIVisitas';
import { actualizarVisita } from '../../../../redux/slices/visitasActivasSlice';
import connection from '../../../../connections/HubConnMozo';
import { useSnackbar } from '../../../../hooks/useSnackbar.jsx';

export const useAgregarPedidos = (open, idVisita, numeroMesa, onClose) => {
    const dispatch = useDispatch();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState(null);
    const [comanda, setComanda] = useState([]);
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

    // Calcular total de la comanda
    const totalComanda = useMemo(() => {
        return comanda.reduce((total, item) => {
            return total + (item.producto.precio * item.cantidad);
        }, 0);
    }, [comanda]);

    // Calcular total de items
    const totalItems = useMemo(() => {
        return comanda.reduce((sum, item) => sum + item.cantidad, 0);
    }, [comanda]);

    // Agregar producto a la comanda (useCallback estable para evitar re-renders de ListaProductos)
    const agregarAComanda = useCallback((producto) => {
        setComanda((prev) => {
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

    // Actualizar cantidad en comanda
    const actualizarCantidad = useCallback((productoId, nuevaCantidad) => {
        setComanda((prev) => {
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
        setComanda((prev) =>
            prev.map(item =>
                item.producto.id === productoId
                    ? { ...item, indicaciones }
                    : item
            )
        );
    }, []);

    // Enviar pedidos
    const handleEnviarPedidos = async () => {
        if (comanda.length === 0 || !idVisita) return;

        setLoading(true);
        try {
            const itemsParaEnviar = [];
            comanda.forEach(item => {
                // Agregar cada producto con su cantidad
                itemsParaEnviar.push({
                    idProducto: item.producto.id,
                    detalles: item.indicaciones || '',
                    cantidad: item.cantidad
                });
            });
            
            const visitaActualizada = await AgregarProductosAVisita(idVisita, itemsParaEnviar);
            
            if (visitaActualizada) {
                // Actualizar Redux con la visita actualizada del backend
                // Asegurar que tenga el número de mesa para poder encontrarla en Redux
                dispatch(actualizarVisita({
                    ...visitaActualizada,
                    numeroMesa: numeroMesa
                }));
                
                connection.send("RecargarTicket", numeroMesa);
                setComanda([]);
                onClose();
            } else {
                // Si no hay productos en la respuesta, al menos cerrar el modal
                setComanda([]);
                onClose();
            }
        } catch (error) {
            console.error('Error al enviar pedidos:', error);
            showSnackbar('Error al agregar los pedidos. Por favor, intenta nuevamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Limpiar estado
    const limpiarEstado = () => {
        setComanda([]);
        setBusqueda('');
        setCategoriaFiltro(null);
    };

    return {
        // Estado
        productos,
        categorias,
        productosFiltrados,
        comanda,
        busqueda,
        categoriaFiltro,
        loading,
        totalComanda,
        totalItems,
        snackbar,
        
        // Acciones
        setBusqueda,
        setCategoriaFiltro,
        agregarAComanda,
        actualizarCantidad,
        actualizarIndicaciones,
        handleEnviarPedidos,
        limpiarEstado,
        closeSnackbar
    };
};

