export const Campos = [
  { name: "fechaHora", label: "Fecha y Hora", type: "datetime-local", required: true, validation: { rule: "datetime" } },
  { name: "nombreReserva", label: "Nombre de Reserva", type: "text", required: true, validation: { rule: "text" } },
  { name: "telefono", label: "Teléfono", type: "text", required: true, validation: { rule: "phone" }, inputProps: { inputMode: "numeric" } },
  { name: "cantidadDePersonas", label: "Cantidad de Personas", type: "number", required: true, validation: { rule: "integer", min: 1, max: 999 } },
  { 
    name: "IdEstadoReserva", 
    label: "Estado", 
    type: "select", 
    required: true,
    validation: { rule: "select" },
    options: [
      { id: 1, nombre: "Pendiente" },
      { id: 2, nombre: "Confirmada" },
      { id: 3, nombre: "Cancelada" },
      { id: 4, nombre: "Completada" }
    ] 
  },
];

