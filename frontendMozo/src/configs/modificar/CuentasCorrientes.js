export const Campos = [
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "telefono", label: "Teléfono", type: "text" },
  { name: "domicilio", label: "Domicilio", type: "text" },
  {
    name: "descuento",
    label: "Descuento (%)",
    type: "number",
    min: 0,
    placeholder: "Ej.: 30",
    helperText: "Ingresá 30 para indicar 30%.",
    endAdornmentText: "%",
    infoTooltip: "Este campo usa porcentaje directo. Si querés 30%, escribí 30.",
  },
];
