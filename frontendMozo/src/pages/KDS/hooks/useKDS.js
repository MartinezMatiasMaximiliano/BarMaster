import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { cambiarEstadoPreparacion } from '../../../redux/slices/visitasActivasSlice';
import { CambiarEstadoProducto } from '../../../API/APIVisitas';
import { useSnackbar } from '../../../hooks/useSnackbar.jsx';

/**
 * Hook personalizado para manejar la lógica del KDS (Kitchen Display System)
 * Gestiona visitas, estados, filtros y actualizaciones en tiempo real
 */
export const useKDS = () => {
    const dispatch = useDispatch();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const visitasActivasRedux = useSelector(
        (state) => state.visitasActivas.value,
        shallowEqual
    );

    const visitasActivas = useMemo(
        () => (visitasActivasRedux && visitasActivasRedux.length > 0) ? visitasActivasRedux : [],
        [visitasActivasRedux]
    );

    // Estados locales
    const [filtroEstado, setFiltroEstado] = useState(['todos']); // Array de filtros seleccionados: ['todos'], ['pendiente'], ['en_preparacion'], ['listo'], o combinaciones
    const [ordenamiento, setOrdenamiento] = useState('mas_antiguo'); // 'mas_antiguo', 'mas_nuevo', 'por_mesas', 'por_estado'
    const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
    const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
    
    // Estado para notificaciones de acciones reversibles
    const [notificacion, setNotificacion] = useState(null);

    // Orden de estados para ordenar (Pendiente -> En Preparación -> Listo)
    const ordenEstado = { 'Pendiente': 0, 'En Preparación': 1, 'Listo': 2 };

    // Transformar visitas activas en productos individuales para el KDS (estado como string, igual que la API/DB)
    const itemsKDS = useMemo(() => {
        const items = [];

        visitasActivas.forEach(visita => {
            const productos = visita.productosConsumidos || [];
            
            productos.forEach(producto => {
                // Mostrar solo productos que no estén pagados
                if (!producto.estadoPagado) {
                    const estado = producto.estadoPedido;
                    const fechaAgregado = producto.fechaAgregado;
                    items.push({
                        id: producto.id,
                        nombre: producto.nombre,
                        indicaciones: producto.indicaciones,
                        fechaHora: visita.fechaHora,
                        fechaAgregado, // Fecha en que se agregó este producto (para antigüedad del pedido)
                        numeroMesa: visita.numeroMesa,
                        estado, // "Pendiente" | "En Preparación" | "Listo"
                        precio: producto.precio
                    });
                }
            });
        });

        // Ordenar según el criterio seleccionado
        const fechaItem = (item) => new Date(item.fechaAgregado ?? item.fechaHora);
        return items.sort((a, b) => {
            switch (ordenamiento) {
                case 'mas_nuevo':
                    return fechaItem(b) - fechaItem(a);
                
                case 'por_mesas':
                    if (a.numeroMesa !== b.numeroMesa) {
                        return a.numeroMesa - b.numeroMesa;
                    }
                    return fechaItem(a) - fechaItem(b);
                
                case 'por_estado':
                    const ordenA = ordenEstado[a.estado] ?? 0;
                    const ordenB = ordenEstado[b.estado] ?? 0;
                    if (ordenA !== ordenB) return ordenA - ordenB;
                    return fechaItem(a) - fechaItem(b);
                
                case 'mas_antiguo':
                default:
                    return fechaItem(a) - fechaItem(b);
            }
        });
    }, [visitasActivas, ordenamiento]);

    // Filtrar items según el estado seleccionado
    const itemsFiltrados = useMemo(() => {
        // Si "todos" está seleccionado, mostrar todos los items
        if (filtroEstado.includes('todos')) {
            return itemsKDS;
        }

        // Si no hay filtros seleccionados, mostrar todos
        if (filtroEstado.length === 0) {
            return itemsKDS;
        }

        const estadoMap = {
            'pendiente': 'Pendiente',
            'en_preparacion': 'En Preparación',
            'listo': 'Listo'
        };

        const estadosSeleccionados = filtroEstado
            .map(filtro => estadoMap[filtro])
            .filter(Boolean);

        return itemsKDS.filter(item => estadosSeleccionados.includes(item.estado));
    }, [itemsKDS, filtroEstado]);

    // Detectar nuevos pedidos para reproducir sonido
    useEffect(() => {
        if (itemsKDS.length > 0 && sonidoHabilitado) {
            const ultimoItem = itemsKDS[itemsKDS.length - 1];
            
            // Si es un pedido nuevo (diferente al último visto)
            if (ultimoPedidoId !== ultimoItem.id) {
                setUltimoPedidoId(ultimoItem.id);
                
                // Reproducir sonido de notificación
                try {
                    const audio = new Audio('/notification.mp3');
                    audio.volume = 0.5;
                    audio.play().catch(() => {});
                } catch (e) {
                }
            }
        }
    }, [itemsKDS, sonidoHabilitado, ultimoPedidoId]);

    // Obtener el estado anterior de un item antes de cambiarlo
    const obtenerEstadoAnterior = useCallback((itemId) => {
        const item = itemsKDS.find(i => i.id === itemId);
        return item ? item.estado : null;
    }, [itemsKDS]);

    // Marcar producto como "En preparación"
    const marcarEnPreparacion = useCallback(async (productoId) => {
        try {
            const estadoAnterior = obtenerEstadoAnterior(productoId);
            
            // Si hay datos en Redux, actualizar en la base de datos y Redux
            if (visitasActivasRedux?.length > 0) {
                await CambiarEstadoProducto(productoId, "En Preparación");
                dispatch(cambiarEstadoPreparacion({ idsProductos: [productoId], estadoNuevo: "En Preparación" }));
            }
            setNotificacion({
                itemId: productoId,
                estadoAnterior,
                estadoNuevo: "En Preparación",
                mensaje: 'Pedido marcado como "En Preparación"',
                accion: 'en_preparacion'
            });
        } catch (error) {
            console.error('Error al marcar como en preparación:', error);
            showSnackbar('Error al actualizar el estado del pedido', 'error');
        }
    }, [dispatch, visitasActivasRedux, obtenerEstadoAnterior, showSnackbar]);

    // Marcar producto como "Listo"
    const marcarListo = useCallback(async (productoId) => {
        try {
            const estadoAnterior = obtenerEstadoAnterior(productoId);
            
            // Si hay datos en Redux, actualizar en la base de datos y Redux
            if (visitasActivasRedux?.length > 0) {
                await CambiarEstadoProducto(productoId, "Listo");
                dispatch(cambiarEstadoPreparacion({ idsProductos: [productoId], estadoNuevo: "Listo" }));
            }
            setNotificacion({
                itemId: productoId,
                estadoAnterior,
                estadoNuevo: "Listo",
                mensaje: 'Pedido marcado como "Listo"',
                accion: 'listo'
            });
        } catch (error) {
            console.error('Error al marcar como listo:', error);
            showSnackbar('Error al actualizar el estado del pedido', 'error');
        }
    }, [dispatch, visitasActivasRedux, obtenerEstadoAnterior, showSnackbar]);

    // Revertir acción (volver al estado anterior)
    const revertirAccion = useCallback(async (notificacion) => {
        if (!notificacion) return;
        
        try {
            const { itemId, estadoAnterior } = notificacion;
            
            // Si hay datos en Redux, actualizar en la base de datos y Redux
            if (visitasActivasRedux?.length > 0) {
                const estadoTexto = estadoAnterior || "Pendiente";
                await CambiarEstadoProducto(itemId, estadoTexto);
                dispatch(cambiarEstadoPreparacion({ idsProductos: [itemId], estadoNuevo: estadoTexto }));
            }
            // Cerrar la notificación
            setNotificacion(null);
            
            // Mostrar mensaje de éxito
            showSnackbar('Estado revertido correctamente', 'success');
        } catch (error) {
            console.error('Error al revertir acción:', error);
            showSnackbar('Error al revertir la acción', 'error');
        }
    }, [dispatch, visitasActivasRedux, showSnackbar, setNotificacion]);

    // Marcar múltiples productos como listos
    const marcarMultiplesListos = useCallback(async (productosIds) => {
        try {
            // Actualizar en la base de datos - llamar al endpoint para cada producto
            await Promise.all(
                productosIds.map(id => CambiarEstadoProducto(id, "Listo"))
            );
            
            dispatch(cambiarEstadoPreparacion({ idsProductos: productosIds, estadoNuevo: "Listo" }));
        } catch (error) {
            console.error('Error al marcar múltiples productos como listos:', error);
            showSnackbar('Error al actualizar los estados de los pedidos', 'error');
        }
    }, [dispatch, showSnackbar]);

    // Calcular tiempo transcurrido desde que se creó el pedido
    const calcularTiempoTranscurrido = useCallback((fechaHora) => {
        const ahora = new Date();
        const fecha = new Date(fechaHora);
        const diferencia = ahora - fecha;
        
        const minutos = Math.floor(diferencia / 60000);
        const segundos = Math.floor((diferencia % 60000) / 1000);
        
        if (minutos > 0) {
            return `${minutos}m ${segundos}s`;
        }
        return `${segundos}s`;
    }, []);

    const estadisticas = useMemo(() => {
        return {
            total: itemsKDS.length,
            pendientes: itemsKDS.filter(i => i.estado === 'Pendiente').length,
            enPreparacion: itemsKDS.filter(i => i.estado === 'En Preparación').length,
            listos: itemsKDS.filter(i => i.estado === 'Listo').length
        };
    }, [itemsKDS]);

    return {
        // Datos
        itemsFiltrados,
        itemsKDS,
        estadisticas,
        
        // Estados
        filtroEstado,
        ordenamiento,
        sonidoHabilitado,
        notificacion,
        snackbar,
        
        // Setters
        setFiltroEstado,
        setOrdenamiento,
        setSonidoHabilitado,
        setNotificacion,
        
        // Funciones
        marcarEnPreparacion,
        marcarListo,
        marcarMultiplesListos,
        revertirAccion,
        calcularTiempoTranscurrido,
        closeSnackbar
    };
};

