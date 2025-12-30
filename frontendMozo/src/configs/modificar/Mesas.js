import { BuscarTodosLosMozos } from "../../API/APIPersonas";
import { BuscarTodosLosPlanos } from "../../API/APIPlanos";

// Definir la estructura base de los campos
const camposBase = [
  { name: "idMozo", label: "Mozo", type: "select", options: [] },
  { name: "idPlano", label: "Plano", type: "select", options: [] },
];

// Función para inicializar los campos con los datos de mozos y planos
// Esta función se llamará solo cuando se necesite, no al importar el módulo
export const inicializarCampos = async () => {
  try {
    // Cargar mozos y planos en paralelo
    const [dataMozos, dataPlanos] = await Promise.all([
      BuscarTodosLosMozos(),
      BuscarTodosLosPlanos()
    ]);

    console.log("Data mozos:", dataMozos);
    console.log("Data planos:", dataPlanos);

    // Verificar que los datos sean arrays válidos
    const mozos = Array.isArray(dataMozos)
      ? dataMozos
          .filter(m => m && m.datosPersonales && m.datosPersonales.activo === true)
          .map(m => ({
            id: m.id,
            nombre: `${m.datosPersonales.nombres} ${m.datosPersonales.apellido}`,
          }))
      : [];

    const planos = Array.isArray(dataPlanos)
      ? dataPlanos.map(p => ({
          id: p.id,
          nombre: p.nombre,
        }))
      : [];

    // Retornar una copia de los campos con las opciones cargadas
    return [
      { ...camposBase[0], options: mozos },
      { ...camposBase[1], options: planos },
    ];
  } catch (error) {
    console.error("Error al cargar mozos o planos:", error);
    // Retornar campos sin opciones en caso de error
    return camposBase;
  }
};

// Exportar campos base para compatibilidad (se inicializarán cuando se necesiten)
export const Campos = camposBase;
