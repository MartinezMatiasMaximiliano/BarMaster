import {BuscarTodasLasCategorias} from "../../API/APICategorias";

const categorias = BuscarTodasLasCategorias().then(data => { const categoriasActivas = data.filter(categoria => categoria.activo === true); return categoriasActivas.map(categoria => categoria.nombre); });

export const Campos = [
  { name: "imagen", label: "Imagen", type: "image" },
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "precio", label: "Precio", type: "text" },
  { name: "descripcion", label: "Descripción", type: "text" },
  { name: "categorias", label: "Categorías", type: "select_multiple", options: categorias },
];