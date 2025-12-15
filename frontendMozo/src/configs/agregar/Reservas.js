export const Campos = [
  { name: "FechaHora", label: "Fecha y Hora", type: "datetime-local" },
  { name: "NombreReserva", label: "Nombre de Reserva", type: "text" },
  { name: "Telefono", label: "Teléfono", type: "text" },
  { name: "CantidadDePersonas", label: "Cantidad de Personas", type: "number" },
  { name: "Mesa", label: "Mesa", type: "number" },
  { 
    name: "Estado", 
    label: "Estado", 
    type: "select", 
    options: [
      { id: "Programado", nombre: "Programado" },
      { id: "En Curso", nombre: "En Curso" },
      { id: "Finalizado", nombre: "Finalizado" }
    ] 
  },
];

