// hooks/useMesaLogic.js
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    cambiarEstadoPagadoPorMesa, 
    eliminarProductos, 
    agregarVisita 
} from '../../redux/slices/visitasActivasSlice';
import { EliminarItems } from '../../API/APIItems';
import { AbrirCerrarMesa } from '../../API/APIMesas';
import { GenerarTicketPDF } from '../../API/APIPedidos';
import connection from '../../connections/HubConnMozo';

export const useMesaLogic = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const obtenerIdProductosPendientes = (productos) => {
        return productos
            .filter(producto => !producto.estadoPagado)
            .map(producto => producto.id);
    };

    const cancelarPedidos = async (idsProductos, numeroMesa, onSuccess) => {
        try {
            await EliminarItems(idsProductos, numeroMesa);
            dispatch(eliminarProductos({ 
                numeroMesa, 
                idsProductos 
            }));
            onSuccess?.();
        } catch (error) {
            console.error('Error al cancelar productos:', error);
        }
    };

    const cerrarMesa = async (mesaId, numeroMesa, productos) => {
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

            // Recargar vista
            navigate('/?=' + Date.now());
        } catch (error) {
            console.error('Error al cerrar mesa:', error);
        }
    };

    const abrirMesa = async (request) => {
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
                id: response.id,
                fechaHora: response.fechaHora,
                idMesa: response.idMesa,
                idCaja: response.idCaja,
                idMozo: response.idMozo,
                estado: response.estado,
                mesa: {
                    id: response.idMesa,
                    numero: numeroMesa // Lo obtenemos del request
                },
                productos: [] // Una mesa recién abierta no tiene productos
            };
            
            dispatch(agregarVisita(datosVisita));
            navigate('/?=' + Date.now());
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