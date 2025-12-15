import { BuscarTodosLosProductos } from "../../API/APIProductos";

const tiposDeEnvio = [
  { id: 1, nombre: "Corto", precio: 500 },
  { id: 2, nombre: "Mediano", precio: 750 },
  { id: 3, nombre: "Largo", precio: 1000 },
];

const camposBase = [
  { name: "Cliente", label: "Cliente", type: "text" },
  { name: "Direccion", label: "Dirección", type: "text" },
  { name: "Telefono", label: "Teléfono", type: "text" },
  { name: "Indicaciones", label: "Indicaciones", type: "text" },
  { name: "TipoEnvio", label: "Tipo de Envío", type: "select", options: tiposDeEnvio },
  { name: "Productos", label: "Productos", type: "select", options: [] },
];

// Función para inicializar los campos con los datos de productos
export const inicializarCampos = async () => {
  try {
    const data = await BuscarTodosLosProductos();
    const productos = (data ?? [])
      .filter(producto => producto.activo)
      .map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
      }));

    // Retornar una copia de los campos con las opciones cargadas
    return camposBase.map((campo, index) => 
      index === 5 ? { ...campo, options: productos } : campo
    );
  } catch (error) {
    console.error("Error al cargar productos:", error);
    return camposBase;
  }
};

// Exportar campos base para compatibilidad
export const Campos = camposBase;

