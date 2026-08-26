using BackEndAPI.DTOs.Hub;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using Microsoft.AspNetCore.SignalR;

namespace BackEndAPI.Hubs
{
    public class NotificacionesHub : Hub
    {
        //invocada cuando se inicia el frontend mozo
        public async Task RegistrarMozoAGrupo(string connectionId)
        {
            await Groups.AddToGroupAsync(connectionId, "Mozos");
        }

        //invocada por el cliente con los botones de notificar en Mesas.jsx
        public async Task EnviarNotificacionAMozos(NotificacionMozoDTO notificacion)
        {
            await Clients.Group("Mozos").SendAsync("RegistrarNotificacion",notificacion);
        }

        public async Task GuardarCarrito(List<EnviarCarritoDTO> DTO, int numeroMesa)
        {
                await Clients.Group("Mozos").SendAsync("RegistrarProducto", DTO, numeroMesa);
        }

        public async Task NotificarVisitaActualizada(object visitaActualizada)
        {
            await Clients.Group("Mozos").SendAsync("VisitaActualizada", visitaActualizada);
        }

        public async Task PagarMesa(int IdPedido)
        {
            await Clients.Group("Mozos").SendAsync("PagarMesa", IdPedido);
        }

        public async Task PagarMesaSeparado(List<int> ArrayIdItems)
        {
            await Clients.Group("Mozos").SendAsync("PagarMesaSeparado", ArrayIdItems);
        }

        public async Task RecargarTicket(int NumeroMesa)
        {
            await Clients.All.SendAsync("RecargarTicket", NumeroMesa);
        }

        public async Task RecargarMenu()
        {
            await Clients.All.SendAsync("RecargarMenu");
        }

        public async Task StockActualizado()
        {
            await Clients.All.SendAsync("StockActualizado");
        }

        public async Task RecargarDeliveryTakeaway() {
            await Clients.Group("Mozos").SendAsync("RecargarDeliveryTakeaway");
        }

        public async Task MesaCerrada(int NumeroMesa)
        {
            await Clients.All.SendAsync("MesaCerrada", NumeroMesa);
        }

    }
}
