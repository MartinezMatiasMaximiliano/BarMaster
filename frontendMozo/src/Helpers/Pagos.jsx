    export async function pagarTotal(IdPedido) {

        const pedido = await BuscarUnPedido(IdPedido);

        if (pedido) {
            const ListaItems = pedido.items.filter(item => item.estado === 0).map(item => item.id);

            // Hacer la actualización en la base de datos
            CambiarEstadoItems(ListaItems, "Procesando");

            // Agrego el ticket
            dispatch(agregarTicket(ListaItems));

            // Actualizar el estado en Redux
            dispatch(cambiarEstadoItems({ idsItems: ListaItems, estadoNuevo: 1 }));
        }
    }

    export function pagarSeparado(ArrayIdsItems) {

        // Hago los cambios en la DB
        CambiarEstadoItems(ArrayIdsItems, "Procesando");

        // Agrego el ticket

        dispatch(agregarTicket(ArrayIdsItems));

        // Actualizo el estado
        dispatch(cambiarEstadoItems({ idsItems: ArrayIdsItems, estadoNuevo: 1 }));
    };