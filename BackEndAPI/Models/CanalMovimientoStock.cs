namespace BackEndAPI.Models
{
    public enum CanalMovimientoStock
    {
        Manual = 0,
        Local = 1,
        Delivery = 2,
        Takeaway = 3
    }

    public static class CanalesMovimientoStock
    {
        private static readonly IReadOnlyDictionary<string, CanalMovimientoStock> PorOrigen =
            new Dictionary<string, CanalMovimientoStock>(StringComparer.OrdinalIgnoreCase)
            {
                ["Local"] = CanalMovimientoStock.Local,
                ["Delivery"] = CanalMovimientoStock.Delivery,
                ["Takeaway"] = CanalMovimientoStock.Takeaway
            };

        public static CanalMovimientoStock DesdeOrigen(string? origen)
        {
            if (origen != null && PorOrigen.TryGetValue(origen, out var canal))
            {
                return canal;
            }

            throw new ArgumentException($"Origen de venta no válido: {origen ?? "vacío"}", nameof(origen));
        }
    }
}
