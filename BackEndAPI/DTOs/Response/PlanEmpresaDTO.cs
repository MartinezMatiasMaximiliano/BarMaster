namespace BackEndAPI.DTOs.Response;

public record PlanEmpresaDTO(short Id, string Nombre, decimal Precio, string[] Prestaciones);
