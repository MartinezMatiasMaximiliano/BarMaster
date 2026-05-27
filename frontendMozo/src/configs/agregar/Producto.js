import { BuscarTodasLasCategorias } from "../../API/APICategorias";

const camposBase = [
  { name: "imagen", label: "Imagen", type: "image", validation: { rule: "image" } },
  { name: "codigo", label: "Código", type: "text", validation: { rule: "text" } },
  { name: "nombre", label: "Nombre", type: "text", required: true, validation: { rule: "text" } },
  { name: "precio", label: "Precio", type: "decimal", required: true, validation: { rule: "money" } },
  { name: "costoProduccion", label: "Costo de Producción", type: "decimal", validation: { rule: "money" } },
  { name: "descripcion", label: "Descripción", type: "text", validation: { rule: "text" } },
  { name: "categorias", label: "Categorías", type: "select_multiple", required: true, validation: { rule: "select_multiple" }, options: [] },
];

// Función para inicializar los campos con los datos de categorías
export const inicializarCampos = async () => {
  try {
    const data = await BuscarTodasLasCategorias();
    // Guardar categorías completas (con id y nombre) como opciones
    const categoriasCompletas = data.filter(c => c.activo === true);

    // Retornar una copia de los campos con las opciones cargadas
    return camposBase.map((campo, index) => {
      if (index === 6) {
        return { 
          ...campo, 
          options: categoriasCompletas, // Guardar objetos completos con id y nombre
        };
      }
      return campo;
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    return camposBase;
  }
};

// Exportar campos base para compatibilidad
export const Campos = camposBase;
