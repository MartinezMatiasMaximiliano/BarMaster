export const Campos = [
  { name: "nombre", label: "Nombre", type: "text", required: true, validation: { rule: "text" } },
  { name: "telefono", label: "Teléfono", type: "text", required: true, validation: { rule: "phone" }, inputProps: { inputMode: "numeric" } },
  { name: "domicilio", label: "Domicilio", type: "text", required: true, validation: { rule: "text" } },
  {
    name: "descuento",
    label: "Descuento (%)",
    type: "number",
    min: 0,
    max: 100,
    validation: { rule: "integer", min: 0, max: 100, maxLength: 3 },
    placeholder: "Ej.: 30",
    helperText: "Ingresá 30 para indicar 30%.",
    endAdornmentText: "%",
    infoTooltip: "Este campo usa porcentaje directo. Si querés 30%, escribí 30.",
  },
];
