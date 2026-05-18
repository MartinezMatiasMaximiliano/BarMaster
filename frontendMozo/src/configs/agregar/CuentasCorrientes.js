export const Campos = [
  { name: "nombre", label: "Nombre", type: "text", required: true, validation: { rule: "text" } },
  { name: "telefono", label: "Teléfono", type: "text", required: true, validation: { rule: "phone" }, inputProps: { inputMode: "numeric" } },
  { name: "domicilio", label: "Domicilio", type: "text", required: true, validation: { rule: "text" } },
];

