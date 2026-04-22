// Definir la estructura de los campos
const camposBase = [
  { name: "capacidad", label: "Capacidad", type: "number", required: true, validation: { rule: "integer", min: 1 } },
];

// Función para inicializar los campos (mantener compatibilidad con el componente)
export const inicializarCampos = async () => {
  // Ya no es necesario cargar datos externos, solo retornar los campos
  return camposBase;
};

// Exportar campos base para compatibilidad
export const Campos = camposBase;
