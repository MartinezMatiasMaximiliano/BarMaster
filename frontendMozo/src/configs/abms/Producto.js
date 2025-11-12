import { BuscarTodasLasCategorias } from "../../API/APICategorias";

const data = await BuscarTodasLasCategorias();
const categorias = data
  .filter(c => c.activo === true)
  .map(c => c.nombre);

export const Campos = [
  { name: "imagen", label: "Imagen", type: "image" },
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "precio", label: "Precio", type: "text" },
  { name: "descripcion", label: "Descripción", type: "text" },
  { name: "categorias", label: "Categorías", type: "select_multiple", options: categorias },
];
