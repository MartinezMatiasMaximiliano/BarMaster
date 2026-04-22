import { BuscarTodosLosPlanos } from "../../API/APIPlanos";

// Definir la estructura base de los campos
const camposBase = [
  { name: "numero", label: "Numero de Mesa", type: "text", required: true, validation: { rule: "integer", min: 1 } },
  { name: "idPlano", label: "Plano", type: "select", validation: { rule: "select" }, options: [] },
  { name: "capacidad", label: "Capacidad", type: "number", required: true, validation: { rule: "integer", min: 1 } },
];

// Función para inicializar los campos con los datos de planos
// Esta función se llamará solo cuando se necesite, no al importar el módulo
export const inicializarCampos = async () => {
  try {
    const data = await BuscarTodosLosPlanos();

    // Verificar que los datos sean un array válido
    const planos = Array.isArray(data)
      ? data.map(p => ({
          id: p.id,
          nombre: p.nombre,
        }))
      : [];

    // Retornar una copia de los campos con las opciones cargadas
    return [
      camposBase[0],
      { ...camposBase[1], options: planos },
      camposBase[2],
    ];
  } catch (error) {
    console.error("Error al cargar planos:", error);
    // Retornar campos sin opciones en caso de error
    return camposBase;
  }
};

// Exportar campos base para compatibilidad (se inicializarán cuando se necesiten)
export const Campos = camposBase;
