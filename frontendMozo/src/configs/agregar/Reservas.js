export const Campos = [
  { name: "fechaHora", label: "Fecha y Hora", type: "datetime-local" },
  { name: "nombreReserva", label: "Nombre de Reserva", type: "text" },
  { name: "cantidadDePersonas", label: "Cantidad de Personas", type: "number" },
  { 
    name: "IdEstadoReserva", 
    label: "Estado", 
    type: "select", 
    options: [
      { id: 1, nombre: "Pendiente" },
      { id: 2, nombre: "Confirmada" },
      { id: 3, nombre: "Cancelada" },
      { id: 4, nombre: "Completada" }
    ] 
  },
];

