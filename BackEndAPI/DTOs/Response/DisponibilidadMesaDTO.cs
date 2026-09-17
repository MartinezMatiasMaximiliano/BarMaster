namespace BackEndAPI.DTOs.Response;

public sealed record DisponibilidadMesaDTO(
    Guid Id,
    int Numero,
    int Capacidad,
    PlanoDTO Plano,
    string EstadoDisponibilidad,
    int? DistanciaReservaMinutos);
