import { BuscarTodosLosMozos } from "../../API/APIPersonas";

// Definir la estructura base de los campos
const camposBase = [
  { name: "idMozo", label: "Mozo", type: "select", options: [] },
];

// Función para inicializar los campos con los datos de mozos
// Esta función se llamará solo cuando se necesite, no al importar el módulo
export const inicializarCampos = async () => {
  try {
    const data = await BuscarTodosLosMozos();
    const mozos = data
      .filter(m => m.datosPersonales.activo === true)
      .map(m => ({
        id: m.id,
        nombre: `${m.datosPersonales.nombres} ${m.datosPersonales.apellido}`,
      }));

    // Retornar una copia de los campos con las opciones cargadas
    return [
      { ...camposBase[0], options: mozos },
    ];
  } catch (error) {
    console.error("Error al cargar mozos:", error);
    // Retornar campos sin opciones en caso de error
    return camposBase;
  }
};

// Exportar campos base para compatibilidad (se inicializarán cuando se necesiten)
export const Campos = camposBase;
