import { BuscarTodosLosProductos } from "../../API/APIProductos";

const data = await BuscarTodosLosProductos();
const productos = (data ?? [])
  .filter((producto) => producto.activo)
  .map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
  }));

const tiposDeEnvio = [
  { id: 1, nombre: "Corto", precio: 500 },
  { id: 2, nombre: "Mediano", precio: 750 },
  { id: 3, nombre: "Largo", precio: 1000 },
];

export const Campos = [
  { name: "Cliente", label: "Cliente", type: "text" },
  { name: "Direccion", label: "Dirección", type: "text" },
  { name: "Telefono", label: "Teléfono", type: "text" },
  { name: "Indicaciones", label: "Indicaciones", type: "text" },
  { name: "TipoEnvio", label: "Tipo de Envío", type: "select", options: tiposDeEnvio },
  { name: "Productos", label: "Productos", type: "select", options: productos },
];