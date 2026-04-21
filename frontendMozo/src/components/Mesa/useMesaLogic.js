// hooks/useMesaLogic.js
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    cambiarEstadoPagadoPorMesa, 
    eliminarProductos, 
    agregarVisita,
    actualizarVisita
} from '../../redux/slices/visitasActivasSlice';
import { EliminarProductosVisita, ObtenerVisitaPorId } from '../../API/APIVisitas';
import { AbrirCerrarMesa } from '../../API/APIMesas';
import { GenerarTicketPDF } from '../../API/APIPedidos';
import connection, { sendHubMessage } from '../../connections/HubConnMozo';

export const useMesaLogic = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const obtenerIdProductosPendientes = (productos) => {
        return productos
            .filter(producto => !producto.estadoPagado)
            .map(producto => producto.id);
    };

    const cancelarPedidos = async (idsProductos, idVisita, numeroMesa, onSuccess) => {
        try {
            await EliminarProductosVisita(idVisita, idsProductos);
            dispatch(eliminarProductos({ 
                numeroMesa, 
                idsProductos 
            }));

            const visitaActualizada = await ObtenerVisitaPorId(idVisita);
            if (visitaActualizada) {
                const visitaActualizadaConMesa = {
                    ...visitaActualizada,
                    numeroMesa
                };

                dispatch(actualizarVisita(visitaActualizadaConMesa));
                await sendHubMessage("NotificarVisitaActualizada", visitaActualizadaConMesa);
            }

            await sendHubMessage("RecargarTicket", numeroMesa);
            onSuccess?.();
        } catch (error) {
            console.error('Error al cancelar productos:', error);
        }
    };

    const cerrarMesa = async (mesaId, numeroMesa, productos, index2 = false) => {
        try {
            const productosPendientes = obtenerIdProductosPendientes(productos);
            
            // Generar factura si hay productos pendientes
            if (productosPendientes.length > 0) {
                await GenerarTicketPDF(numeroMesa, productosPendientes);
            }

            // Marcar todos los productos como pagados
            dispatch(cambiarEstadoPagadoPorMesa({ 
                numeroMesa, 
                pagado: true 
            }));

            // Cerrar mesa en DB usando el endpoint correcto AbrirCerrar con Abrir: false
            const requestDTO = {
                IdMesa: mesaId,
                Abrir: false
            };
            await AbrirCerrarMesa(requestDTO); // Usa el mismo endpoint AbrirCerrar

            // Notificar al cliente
            connection.send("MesaCerrada", numeroMesa);

            // Recargar vista manteniendo la pestaña actual (Index2 o grid)
            if (index2) {
                navigate('/Index2?=' + Date.now());
            } else {
                navigate('/sistema_sucursal?=' + Date.now());
            }
        } catch (error) {
            console.error('Error al cerrar mesa:', error);
        }
    };

    const abrirMesa = async (request, index2=false) => {
        try {
            // Asegurar que el objeto tenga los nombres correctos en PascalCase para el DTO
            const requestDTO = {
                IdMesa: request.idMesa,
                CodigoServicioMozo: request.codigoServicioMozo,
                Abrir: request.abrir,
            };
            
            const response = await AbrirCerrarMesa(requestDTO);
            
            // El backend ahora devuelve VisitaDTO directamente
            // VisitaDTO: { Id, IdCaja, IdMesa, IdMozo, FechaHora, Estado }
            
            // Necesitamos obtener el número de mesa del request original
            // ya que el backend no lo devuelve en VisitaDTO
            const numeroMesa = request.numeroMesa;
            
            // Adaptar respuesta del backend al formato de visita para Redux
            const datosVisita = {
                id: response.id || response.Id,
                fechaHora: response.fechaHora || response.FechaHora,
                idMesa: response.idMesa || response.IdMesa,
                idCaja: response.idCaja || response.IdCaja,
                idMozo: response.idMozo || response.IdMozo,
                estado: response.estado || response.Estado,
                mesa: {
                    id: response.idMesa || response.IdMesa,
                    numero: numeroMesa // Lo obtenemos del request
                }
            };
            
            dispatch(agregarVisita(datosVisita));
            if (index2) {
                navigate('/Index2?=' + Date.now());
            } else {
                navigate('/sistema_sucursal?=' + Date.now());
            }
        } catch (error) {
            console.error('Error al abrir mesa:', error);
        }
    };

    return {
        cancelarPedidos,
        cerrarMesa,
        abrirMesa
    };
};
