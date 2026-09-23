namespace BackEndAPI.Models;

/// <summary>Identificadores inmutables de los roles definidos por el sistema.</summary>
public static class Roles
{
    public const int Admin = 1;
    public const int Mozo = 2;
    public const int Cadete = 3;
    public const int Cajero = 4;

    public static bool PuedeIniciarSesion(int idRol) => idRol is Admin or Cajero;
}
