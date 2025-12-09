import { BuscarTodasLasCategorias } from "../../API/APICategorias";

export const Campos = [
  { name: "imagen", label: "Imagen", type: "image" },
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "precio", label: "Precio", type: "text" },
  { name: "descripcion", label: "Descripción", type: "text" },
  { name: "categorias", label: "Categorías", type: "select_multiple", options: [] },
];

// Carga asincrónica SIN await (no rompe el build)
BuscarTodasLasCategorias().then(data => {
  const categorias = data
    .filter(c => c.activo === true)
    .map(c => c.nombre);

  // Actualizamos el arreglo exportado por referencia
  Campos[4].options = categorias;
});