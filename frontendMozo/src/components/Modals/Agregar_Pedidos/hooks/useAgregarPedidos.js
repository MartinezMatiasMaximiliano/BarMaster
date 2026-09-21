import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generarUUID } from '../../../../Helpers/generarUUID';
import { useDispatch } from 'react-redux';
import { BuscarTodosLosProductos } from '../../../../API/APIProductos';
import { BuscarTodasLasCategorias } from '../../../../API/APICategorias';
import { AgregarProductosAVisita } from '../../../../API/APIVisitas';
import { actualizarVisita } from '../../../../redux/slices/visitasActivasSlice';
import { sendHubMessage } from '../../../../connections/HubConnMozo';
import { useSnackbar } from '../../../../hooks/useSnackbar.jsx';
import { registrarDiagnosticoImpresion } from '../../../../services/impresion/registroDiagnosticoImpresion';

export const useAgregarPedidos = (open, idVisita, numeroMesa, onClose) => {
    const dispatch = useDispatch();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState(null);
    const [comanda, setComanda] = useState([]);
    const [loading, setLoading] = useState(false);
    const enviandoRef = useRef(false);
    const commandIdRef = useRef(null);

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
        commandIdRef.current = null;
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
        commandIdRef.current = null;
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
        commandIdRef.current = null;
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
        if (enviandoRef.current || comanda.length === 0 || !idVisita) return;

        enviandoRef.current = true;
        setLoading(true);
        const inicioEnvio = performance.now();
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
            
            commandIdRef.current ||= generarUUID();
            registrarDiagnosticoImpresion('pedido.envio_iniciado', {
                idComando: commandIdRef.current,
                idVisita,
                cantidadLineas: itemsParaEnviar.length,
                cantidadProductos: itemsParaEnviar.reduce((total, item) => total + item.cantidad, 0),
            });
            const visitaActualizada = await AgregarProductosAVisita(idVisita, itemsParaEnviar, commandIdRef.current);
            registrarDiagnosticoImpresion('pedido.backend_respondio', {
                idComando: commandIdRef.current,
                idVisita,
                duracionMs: Math.round(performance.now() - inicioEnvio),
            });
            
            if (visitaActualizada) {
                const visitaActualizadaConMesa = {
                    ...visitaActualizada,
                    numeroMesa: numeroMesa
                };

                // Actualizar Redux con la visita actualizada del backend
                // Asegurar que tenga el número de mesa para poder encontrarla en Redux
                dispatch(actualizarVisita(visitaActualizadaConMesa));

                await sendHubMessage("NotificarVisitaActualizada", visitaActualizadaConMesa);
                await sendHubMessage("RecargarTicket", numeroMesa);
                setComanda([]);
                commandIdRef.current = null;
                onClose();
            } else {
                // Si no hay productos en la respuesta, al menos cerrar el modal
                setComanda([]);
                commandIdRef.current = null;
                onClose();
            }
        } catch (error) {
            registrarDiagnosticoImpresion('pedido.envio_error', {
                idComando: commandIdRef.current,
                idVisita,
                duracionMs: Math.round(performance.now() - inicioEnvio),
                error: error?.message || String(error),
            });
            console.error('Error al enviar pedidos:', error);
            showSnackbar('Error al agregar los pedidos. Por favor, intenta nuevamente.', 'error');
        } finally {
            enviandoRef.current = false;
            setLoading(false);
        }
    };

    // Limpiar estado
    const limpiarEstado = () => {
        commandIdRef.current = null;
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

