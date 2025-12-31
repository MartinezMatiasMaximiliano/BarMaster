using BackEndAPI.DTOs.Request.Crear;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Linq;

namespace BackEndAPI.Services.Global
{
    public static class FormDataHelper
    {
        public static List<OpcionesDTO> ProcesarOpcionesDesdeForm(IFormCollection form, string nombreProducto)
        {
            var opciones = new List<OpcionesDTO>();
            
            // Capturar múltiples campos "Opciones" con objetos JSON
            if (form.ContainsKey("Opciones"))
            {
                var opcionesValues = form["Opciones"];
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                foreach (var opcionJson in opcionesValues)
                {
                    if (!string.IsNullOrEmpty(opcionJson))
                    {
                        var opcion = DeserializarOpcion(opcionJson, options);
                        if (opcion != null)
                        {
                            opciones.Add(opcion);
                        }
                    }
                }
            }
            
            // Fallback: buscar campos "nombre" (minúscula) separados
            if (opciones.Count == 0 && form.ContainsKey("nombre"))
            {
                var nombresOpciones = form["nombre"];
                foreach (var nombreOpcion in nombresOpciones)
                {
                    if (!string.IsNullOrEmpty(nombreOpcion) && !nombreOpcion.Equals(nombreProducto, StringComparison.OrdinalIgnoreCase))
                    {
                        opciones.Add(new OpcionesDTO { Nombre = nombreOpcion });
                    }
                }
            }
            
            return opciones;
        }

        private static OpcionesDTO? DeserializarOpcion(string opcionJson, JsonSerializerOptions options)
        {
            try
            {
                var opcion = JsonSerializer.Deserialize<OpcionesDTO>(opcionJson, options);
                if (opcion != null && !string.IsNullOrEmpty(opcion.Nombre))
                {
                    return opcion;
                }
            }
            catch
            {
                try
                {
                    var opcionesArray = JsonSerializer.Deserialize<List<OpcionesDTO>>(opcionJson, options);
                    if (opcionesArray != null && opcionesArray.Any())
                    {
                        return opcionesArray.First();
                    }
                }
                catch { }
            }
            
            return null;
        }
    }
}

