import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { cambiarEstadoItems } from '../../../redux/slices/pedidosActivosSlice';
import { CambiarEstadoItems } from '../../../API/APIItems';
import connection from '../../../connections/HubConnMozo';
import datosPruebaKDS from '../utils/datosPruebaKDS.json';

/**
 * Hook personalizado para manejar la lógica del KDS (Kitchen Display System)
 * Gestiona pedidos, estados, filtros y actualizaciones en tiempo real
 */
export const useKDS = () => {
    const dispatch = useDispatch();

    // Obtener pedidos activos de Redux
    const pedidosActivosRedux = useSelector(
        (state) => state.pedidosActivos.value,
        shallowEqual
    );

    // Estado local para datos de prueba (cuando Redux está vacío)
    const [datosPruebaModificados, setDatosPruebaModificados] = useState(null);

    // Usar datos de prueba si Redux está vacío (para desarrollo/demo)
    const pedidosActivos = useMemo(() => {
        // Si hay datos en Redux, usarlos; si no, usar datos de prueba (modificados o originales)
        if (pedidosActivosRedux && pedidosActivosRedux.length > 0) {
            return pedidosActivosRedux;
        }
        // Si hay datos de prueba modificados, usarlos; si no, usar los originales
        return datosPruebaModificados || datosPruebaKDS;
    }, [pedidosActivosRedux, datosPruebaModificados]);

    // Inicializar datos de prueba modificados cuando se cargan por primera vez
    useEffect(() => {
        if (!pedidosActivosRedux || pedidosActivosRedux.length === 0) {
            if (!datosPruebaModificados) {
                // Hacer una copia profunda de los datos de prueba
                setDatosPruebaModificados(JSON.parse(JSON.stringify(datosPruebaKDS)));
            }
        }
    }, [pedidosActivosRedux, datosPruebaModificados]);

    // Estados locales
    const [filtroEstado, setFiltroEstado] = useState(['todos']); // Array de filtros seleccionados: ['todos'], ['pendiente'], ['en_preparacion'], ['listo'], o combinaciones
    const [ordenamiento, setOrdenamiento] = useState('mas_antiguo'); // 'mas_antiguo', 'mas_nuevo', 'por_mesas', 'por_estado'
    const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
    const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
    
    // Estado para notificaciones de acciones reversibles
    const [notificacion, setNotificacion] = useState(null);

    // Transformar pedidos activos en items individuales para el KDS
    const itemsKDS = useMemo(() => {
        const items = [];

        pedidosActivos.forEach(pedido => {
            pedido.items?.forEach(item => {
                // Mostrar items que no estén pagados
                // En Redux: estado 0 = pendiente, 1 = en preparación, 2 = listo (pero no pagado aún)
                // Los items pagados no aparecen en pedidosActivos, así que todos los que están aquí son válidos para el KDS
                // Para el KDS: 0 = pendiente, 1 = en preparación, 2 = listo (aún no pagado)
                items.push({
                    id: item.id,
                    nombre: item.nombre,
                    indicaciones: item.indicaciones || '',
                    cantidad: item.cantidad || 1,
                    fechaHora: pedido.fechaRealizado || new Date().toISOString(),
                    numeroMesa: pedido.numeroMesa,
                    estado: item.estado || 0, // 0: pendiente, 1: en preparación, 2: listo
                    precio: item.precio
                });
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
    }, [pedidosActivos, ordenamiento]);

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
                    audio.play().catch(e => console.log('No se pudo reproducir sonido:', e));
                } catch (e) {
                    console.log('Error al reproducir sonido:', e);
                }
            }
        }
    }, [itemsKDS, sonidoHabilitado, ultimoPedidoId]);

    // Obtener el estado anterior de un item antes de cambiarlo
    const obtenerEstadoAnterior = useCallback((itemId) => {
        const item = itemsKDS.find(i => i.id === itemId);
        return item ? item.estado : null;
    }, [itemsKDS]);

    // Marcar item como "En preparación"
    const marcarEnPreparacion = useCallback(async (itemId) => {
        try {
            const estadoAnterior = obtenerEstadoAnterior(itemId);
            
            // Si hay datos en Redux, actualizar en la base de datos y Redux
            if (pedidosActivosRedux && pedidosActivosRedux.length > 0) {
                await CambiarEstadoItems([itemId], "Procesando");
                dispatch(cambiarEstadoItems({ idsItems: [itemId], estadoNuevo: 1 }));
            } else {
                // Si estamos usando datos de prueba, actualizar el estado local
                setDatosPruebaModificados(prev => {
                    if (!prev) return prev;
                    const nuevosDatos = JSON.parse(JSON.stringify(prev));
                    nuevosDatos.forEach(pedido => {
                        pedido.items?.forEach(item => {
                            if (item.id === itemId) {
                                item.estado = 1;
                            }
                        });
                    });
                    return nuevosDatos;
                });
            }
            
            // Mostrar notificación con opción de revertir
            setNotificacion({
                itemId,
                estadoAnterior,
                estadoNuevo: 1,
                mensaje: 'Pedido marcado como "En Preparación"',
                accion: 'en_preparacion'
            });
        } catch (error) {
            console.error('Error al marcar como en preparación:', error);
            alert('Error al actualizar el estado del pedido');
        }
    }, [dispatch, pedidosActivosRedux, obtenerEstadoAnterior]);

    // Marcar item como "Listo"
    const marcarListo = useCallback(async (itemId) => {
        try {
            const estadoAnterior = obtenerEstadoAnterior(itemId);
            
            // Si hay datos en Redux, actualizar en la base de datos y Redux
            if (pedidosActivosRedux && pedidosActivosRedux.length > 0) {
                await CambiarEstadoItems([itemId], "Listo");
                dispatch(cambiarEstadoItems({ idsItems: [itemId], estadoNuevo: 2 }));
            } else {
                // Si estamos usando datos de prueba, actualizar el estado local
                setDatosPruebaModificados(prev => {
                    if (!prev) return prev;
                    const nuevosDatos = JSON.parse(JSON.stringify(prev));
                    nuevosDatos.forEach(pedido => {
                        pedido.items?.forEach(item => {
                            if (item.id === itemId) {
                                item.estado = 2;
                            }
                        });
                    });
                    return nuevosDatos;
                });
            }
            
            // Mostrar notificación con opción de revertir
            setNotificacion({
                itemId,
                estadoAnterior,
                estadoNuevo: 2,
                mensaje: 'Pedido marcado como "Listo"',
                accion: 'listo'
            });
        } catch (error) {
            console.error('Error al marcar como listo:', error);
            alert('Error al actualizar el estado del pedido');
        }
    }, [dispatch, pedidosActivosRedux, obtenerEstadoAnterior]);

    // Revertir acción (volver al estado anterior)
    const revertirAccion = useCallback(async (notificacion) => {
        try {
            const { itemId, estadoAnterior } = notificacion;
            
            // Si hay datos en Redux, actualizar en la base de datos y Redux
            if (pedidosActivosRedux && pedidosActivosRedux.length > 0) {
                // Determinar el estado de texto según el estado anterior
                let estadoTexto = "Pendiente";
                if (estadoAnterior === 1) estadoTexto = "Procesando";
                else if (estadoAnterior === 2) estadoTexto = "Listo";
                
                await CambiarEstadoItems([itemId], estadoTexto);
                dispatch(cambiarEstadoItems({ idsItems: [itemId], estadoNuevo: estadoAnterior }));
            } else {
                // Si estamos usando datos de prueba, actualizar el estado local
                setDatosPruebaModificados(prev => {
                    if (!prev) return prev;
                    const nuevosDatos = JSON.parse(JSON.stringify(prev));
                    nuevosDatos.forEach(pedido => {
                        pedido.items?.forEach(item => {
                            if (item.id === itemId) {
                                item.estado = estadoAnterior;
                            }
                        });
                    });
                    return nuevosDatos;
                });
            }
            
            // Cerrar la notificación
            setNotificacion(null);
        } catch (error) {
            console.error('Error al revertir acción:', error);
            alert('Error al revertir la acción');
        }
    }, [dispatch, pedidosActivosRedux]);

    // Marcar múltiples items como listos
    const marcarMultiplesListos = useCallback(async (itemIds) => {
        try {
            // Actualizar en la base de datos
            await CambiarEstadoItems(itemIds, "Listo");
            
            // Actualizar en Redux
            dispatch(cambiarEstadoItems({ idsItems: itemIds, estadoNuevo: 2 }));
        } catch (error) {
            console.error('Error al marcar múltiples items como listos:', error);
            alert('Error al actualizar los estados de los pedidos');
        }
    }, [dispatch]);

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
        calcularTiempoTranscurrido
    };
};

