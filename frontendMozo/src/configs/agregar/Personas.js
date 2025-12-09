import { BuscarTodosLosRoles } from "../../API/APIRoles";

export const Campos = [
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "apellido", label: "Apellido", type: "text" },
  { name: "dni", label: "DNI", type: "text" },
  { name: "direccion", label: "Dirección", type: "text" },
  { name: "telefono", label: "Teléfono", type: "text" },
  { name: "rol", label: "Rol", type: "select", options: [] },
];

// Carga asincrónica SIN await (no rompe el build)
BuscarTodosLosRoles().then(data => {
  const roles = data
    .filter(r => r.activo === true || r.activo === undefined)
    .map(r => ({ id: r.id, nombre: r.nombre }));

  // Actualizamos el arreglo exportado por referencia
  Campos[5].options = roles;
});