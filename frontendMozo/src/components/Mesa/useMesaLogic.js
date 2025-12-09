// hooks/useMesaLogic.js
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    cambiarEstadoItemsPorMesa, 
    eliminarItems as eliminarItemsDePedido, 
    agregarPedido 
} from '../../redux/slices/pedidosActivosSlice';
import { EliminarItems } from '../../API/APIItems';
import { AbrirMesa, CerrarMesa } from '../../API/APIMesas';
import { GenerarTicketPDF } from '../../API/APIPedidos';
import connection from '../../connections/HubConnMozo';

export const useMesaLogic = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const obtenerIdItemsPendientes = (items) => {
        return items
            .filter(item => item.estado === 0 || item.estado === 1)
            .map(item => item.id);
    };

    const cancelarPedidos = async (idCheckboxs, numeroMesa, onSuccess) => {
        try {
            await EliminarItems(idCheckboxs, numeroMesa);
            dispatch(eliminarItemsDePedido({ 
                numeroMesa, 
                idsItems: idCheckboxs 
            }));
            onSuccess?.();
        } catch (error) {
            console.error('Error al cancelar pedidos:', error);
        }
    };

    const cerrarMesa = async (mesaId, numeroMesa, items) => {
        try {
            const itemsPendientes = obtenerIdItemsPendientes(items);
            
            // Generar factura si hay items pendientes
            if (itemsPendientes.length > 0) {
                await GenerarTicketPDF(numeroMesa, itemsPendientes);
            }

            // Actualizar estado
            dispatch(cambiarEstadoItemsPorMesa({ 
                numeroMesa, 
                estadoNuevo: 2 
            }));

            // Cerrar mesa en DB
            await CerrarMesa(mesaId);

            // Notificar al cliente
            connection.send("MesaCerrada", numeroMesa);

            // Recargar vista
            navigate('/?=' + Date.now());
        } catch (error) {
            console.error('Error al cerrar mesa:', error);
        }
    };

    const abrirMesa = async (mesaId, codigoServicio) => {
        try {
            const response = await AbrirMesa(mesaId, codigoServicio);
            const { pedido: { id, fechaRealizado, idMesa, numeroMesa, activo, items } } = response;
            
            const datosPedido = { 
                id, 
                fechaRealizado, 
                idMesa, 
                numeroMesa, 
                activo, 
                items 
            };
            
            dispatch(agregarPedido(datosPedido));
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