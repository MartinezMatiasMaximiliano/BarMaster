import { BuscarTodasLasCategorias } from "../../API/APICategorias";

const camposBase = [
  { name: "imagen", label: "Imagen", type: "image" },
  { name: "codigo", label: "Código", type: "text" },
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "precio", label: "Precio", type: "text" },
  { name: "costoProduccion", label: "Costo de Producción", type: "text" },
  { name: "descripcion", label: "Descripción", type: "text" },
  { name: "categorias", label: "Categorías", type: "select_multiple", options: [] },
];

// Función para inicializar los campos con los datos de categorías
export const inicializarCampos = async () => {
  try {
    const data = await BuscarTodasLasCategorias();
    const categorias = data
      .filter(c => c.activo === true)
      .map(c => c.nombre);

    // Retornar una copia de los campos con las opciones cargadas
    return camposBase.map((campo, index) => 
      index === 6 ? { ...campo, options: categorias } : campo
    );
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    return camposBase;
  }
};

// Exportar campos base para compatibilidad
export const Campos = camposBase;