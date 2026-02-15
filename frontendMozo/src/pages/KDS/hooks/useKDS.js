import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { cambiarEstadoPreparacion } from '../../../redux/slices/visitasActivasSlice';
import { CambiarEstadoProducto } from '../../../API/APIVisitas';
import connection from '../../../connections/HubConnMozo';
import datosPruebaKDS from '../utils/datosPruebaKDS.json';
import { useSnackbar } from '../../../hooks/useSnackbar.jsx';

/**
 * Hook personalizado para manejar la lógica del KDS (Kitchen Display System)
 * Gestiona visitas, estados, filtros y actualizaciones en tiempo real
 */
export const useKDS = () => {
    const dispatch = useDispatch();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    // Obtener visitas activas de Redux
    const visitasActivasRedux = useSelector(
        (state) => state.visitasActivas.value,
        shallowEqual
    );

    // Estado local para datos de prueba (cuando Redux está vacío)
    const [datosPruebaModificados, setDatosPruebaModificados] = useState(null);

    // Usar datos de prueba si Redux está vacío (para desarrollo/demo)
    const visitasActivas = useMemo(() => {
        // Si hay datos en Redux, usarlos; si no, usar datos de prueba (modificados o originales)
        if (visitasActivasRedux && visitasActivasRedux.length > 0) {
            return visitasActivasRedux;
        }
        // Si hay datos de prueba modificados, usarlos; si no, usar los originales
        return datosPruebaModificados || datosPruebaKDS;
    }, [visitasActivasRedux, datosPruebaModificados]);

    // Inicializar datos de prueba modificados cuando se cargan por primera vez
    useEffect(() => {
        if (!visitasActivasRedux || visitasActivasRedux.length === 0) {
            if (!datosPruebaModificados) {
                // Hacer una copia profunda de los datos de prueba
                setDatosPruebaModificados(JSON.parse(JSON.stringify(datosPruebaKDS)));
            }
        }
    }, [visitasActivasRedux, datosPruebaModificados]);

    // Estados locales
    const [filtroEstado, setFiltroEstado] = useState(['todos']); // Array de filtros seleccionados: ['todos'], ['pendiente'], ['en_preparacion'], ['listo'], o combinaciones
    const [ordenamiento, setOrdenamiento] = useState('mas_antiguo'); // 'mas_antiguo', 'mas_nuevo', 'por_mesas', 'por_estado'
    const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
    const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
    
    // Estado para notificaciones de acciones reversibles
    const [notificacion, setNotificacion] = useState(null);

    // Transformar visitas activas en productos individuales para el KDS
    const itemsKDS = useMemo(() => {
        const items = [];

        visitasActivas.forEach(visita => {
            const productos = visita.productosConsumidos || [];
            
            productos.forEach(producto => {
                // Mostrar solo productos que no estén pagados
                if (!producto.estadoPagado) {
                    items.push({
                        id: producto.id,
                        nombre: producto.nombre || producto.nombreProducto,
                        indicaciones: producto.indicaciones || producto.detalles || '',
                        cantidad: producto.cantidad || 1,
                        fechaHora: visita.fechaHora || new Date().toISOString(),
                        numeroMesa: visita.mesa?.numero,
                        estado: producto.estadoPreparacion ?? 0, // 0: pendiente, 1: en preparación, 2: listo
                        precio: producto.precio || producto.precioDelMomento
                    });
                }
            });
        });

        // Ordenar según el criterio seleccionado
        return items.sort((a, b) => {
            switch (ordenamiento) {
                case 'mas_nuevo':
                    // Más nuevos primero
                    const fechaA_nuevo = new Date(a.fechaHora);
                    const fechaB_nuevo = new Date(b.fechaHora);
                    return fechaB_nuevo - fechaA_nuevo;
                
                case 'por_mesas':
                    // Ordenar por número de mesa (ascendente)
                    if (a.numeroMesa !== b.numeroMesa) {
                        return a.numeroMesa - b.numeroMesa;
                    }
                    // Si es la misma mesa, ordenar por fecha (más antiguos primero)
                    return new Date(a.fechaHora) - new Date(b.fechaHora);
                
                case 'por_estado':
                    // Ordenar por estado: 0 (pendiente) -> 1 (en preparación) -> 2 (listo)
                    if (a.estado !== b.estado) {
                        return a.estado - b.estado;
                    }
                    // Si es el mismo estado, ordenar por fecha (más antiguos primero)
                    return new Date(a.fechaHora) - new Date(b.fechaHora);
                
                case 'mas_antiguo':
                default:
                    // Más antiguos primero (por defecto)
                    const fechaA_antiguo = new Date(a.fechaHora);
                    const fechaB_antiguo = new Date(b.fechaHora);
                    return fechaA_antiguo - fechaB_antiguo;
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

        // Mapear los filtros seleccionados a estados numéricos
        const estadoMap = {
            'pendiente': 0,
            'en_preparacion': 1,
            'listo': 2
        };

        // Obtener los estados numéricos correspondientes a los filtros seleccionados
        const estadosSeleccionados = filtroEstado
            .map(filtro => estadoMap[filtro])
            .filter(estado => estado !== undefined);

        // Filtrar items que coincidan con alguno de los estados seleccionados
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
            if (visitasActivasRedux && visitasActivasRedux.length > 0) {
                await CambiarEstadoProducto(productoId, "En Preparación");
                dispatch(cambiarEstadoPreparacion({ idsProductos: [productoId], estadoNuevo: 1 }));
            } else {
                // Si estamos usando datos de prueba, actualizar el estado local
                setDatosPruebaModificados(prev => {
                    if (!prev) return prev;
                    const nuevosDatos = JSON.parse(JSON.stringify(prev));
                    nuevosDatos.forEach(visita => {
                        visita.productosConsumidos?.forEach(producto => {
                            if (producto.id === productoId) {
                                producto.estadoPreparacion = 1;
                            }
                        });
                    });
                    return nuevosDatos;
                });
            }
            
            // Mostrar notificación con opción de revertir
            setNotificacion({
                itemId: productoId,
                estadoAnterior,
                estadoNuevo: 1,
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
            if (visitasActivasRedux && visitasActivasRedux.length > 0) {
                await CambiarEstadoProducto(productoId, "Listo");
                dispatch(cambiarEstadoPreparacion({ idsProductos: [productoId], estadoNuevo: 2 }));
            } else {
                // Si estamos usando datos de prueba, actualizar el estado local
                setDatosPruebaModificados(prev => {
                    if (!prev) return prev;
                    const nuevosDatos = JSON.parse(JSON.stringify(prev));
                    nuevosDatos.forEach(visita => {
                        visita.productosConsumidos?.forEach(producto => {
                            if (producto.id === productoId) {
                                producto.estadoPreparacion = 2;
                            }
                        });
                    });
                    return nuevosDatos;
                });
            }
            
            // Mostrar notificación con opción de revertir
            setNotificacion({
                itemId: productoId,
                estadoAnterior,
                estadoNuevo: 2,
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
            if (visitasActivasRedux && visitasActivasRedux.length > 0) {
                // Determinar el estado de texto según el estado anterior
                let estadoTexto = "Pendiente";
                if (estadoAnterior === 1) estadoTexto = "En Preparación";
                else if (estadoAnterior === 2) estadoTexto = "Listo";
                
                await CambiarEstadoProducto(itemId, estadoTexto);
                dispatch(cambiarEstadoPreparacion({ idsProductos: [itemId], estadoNuevo: estadoAnterior }));
            } else {
                // Si estamos usando datos de prueba, actualizar el estado local
                setDatosPruebaModificados(prev => {
                    if (!prev) return prev;
                    const nuevosDatos = JSON.parse(JSON.stringify(prev));
                    nuevosDatos.forEach(visita => {
                        visita.productosConsumidos?.forEach(producto => {
                            if (producto.id === itemId) {
                                producto.estadoPreparacion = estadoAnterior;
                            }
                        });
                    });
                    return nuevosDatos;
                });
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
            
            // Actualizar en Redux
            dispatch(cambiarEstadoPreparacion({ idsProductos: productosIds, estadoNuevo: 2 }));
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

    // Estadísticas
    const estadisticas = useMemo(() => {
        return {
            total: itemsKDS.length,
            pendientes: itemsKDS.filter(i => i.estado === 0).length,
            enPreparacion: itemsKDS.filter(i => i.estado === 1).length,
            listos: itemsKDS.filter(i => i.estado === 2).length
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

