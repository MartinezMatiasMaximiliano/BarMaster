export const Campos = [
  { name: "nombre", label: "Nombre", type: "text", required: true, validation: { rule: "text" } },
  { name: "precio", label: "Precio", type: "decimal", required: true, validation: { rule: "decimal", min: 0, maxDecimals: 2 } }
];
