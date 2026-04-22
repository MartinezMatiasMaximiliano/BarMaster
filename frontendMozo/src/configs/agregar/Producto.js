import { BuscarTodasLasCategorias } from "../../API/APICategorias";

const camposBase = [
  { name: "imagen", label: "Imagen", type: "image" },
  { name: "codigo", label: "Código", type: "text" },
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "precio", label: "Precio", type: "decimal" },
  { name: "costoProduccion", label: "Costo de Producción", type: "decimal" },
  { name: "descripcion", label: "Descripción", type: "text" },
  { name: "categorias", label: "Categorías", type: "select_multiple", options: [] },
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
