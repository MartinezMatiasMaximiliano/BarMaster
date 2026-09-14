namespace BackEndAPI.ARCA.Clases
{
    public static class AlicuotasIva
    {
        private static readonly Dictionary<decimal, int> PorcentajeAId = new()
        {
            { 0m, 3 },
            { 10.5m, 4 },
            { 21m, 5 },
            { 27m, 6 },
            { 5m, 8 },
            { 2.5m, 9 },
        };

        public static int ObtenerId(decimal porcentaje)
        {
            if (PorcentajeAId.TryGetValue(porcentaje, out var id)) return id;
            throw new Exceptions.BusinessRuleException(
                $"El porcentaje de IVA {porcentaje}% no tiene una alícuota de AFIP asociada. Valores válidos: {string.Join(", ", PorcentajeAId.Keys)}.");
        }
    }
}
