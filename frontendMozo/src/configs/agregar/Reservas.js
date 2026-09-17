export const Campos = [
  { name: "fechaHora", label: "Fecha y Hora", type: "datetime-local", required: true, validation: { rule: "datetime" } },
  { name: "nombreReserva", label: "Nombre de Reserva", type: "text", required: true, validation: { rule: "text" } },
  { name: "idMesa", label: "Mesa reservada", type: "select", required: false, options: [{ id: null, nombre: "Sin asignar" }] },
  { name: "telefono", label: "Teléfono", type: "text", required: true, validation: { rule: "phone" }, inputProps: { inputMode: "numeric" } },
  { name: "cantidadDePersonas", label: "Cantidad de Personas", type: "number", required: true, validation: { rule: "integer", min: 1, max: 999 } },
  { 
    name: "IdEstadoReserva", 
    label: "Estado", 
    type: "select", 
    required: true,
    validation: { rule: "select" },
    options: [
      { id: 2, nombre: "Confirmada" },
      { id: 3, nombre: "Cancelada" }
    ] 
  },
];

export const camposConMesas = (mesas = []) => Campos.map(campo => campo.name === 'idMesa'
  ? { ...campo, options: [{ id: null, nombre: 'Sin asignar' }, ...mesas.map(mesa => ({
      id: mesa.id, nombre: `Mesa ${mesa.numero}${mesa.capacidad ? ` · ${mesa.capacidad} personas` : ''}`,
    }))] }
  : campo);

