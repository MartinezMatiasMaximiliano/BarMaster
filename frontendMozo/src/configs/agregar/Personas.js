const camposBase = [
  { name: "nombre", label: "Nombre", type: "text", required: true, validation: { rule: "letters" } },
  { name: "apellido", label: "Apellido", type: "text", required: true, validation: { rule: "letters" } },
  { name: "dni", label: "DNI", type: "text", required: true, validation: { rule: "integer", exactLength: 8 }, inputProps: { inputMode: "numeric" } },
  { name: "direccion", label: "Dirección", type: "text", required: true, validation: { rule: "text" } },
  { name: "telefono", label: "Teléfono", type: "text", required: true, validation: { rule: "phone" }, inputProps: { inputMode: "numeric" } },
  { name: "email", label: "Email", type: "text", required: true, validation: { rule: "email" }, inputProps: { inputMode: "email" } },
  { name: "rol", label: "Rol", type: "select", required: true, validation: { rule: "select" }, options: [] },
];

// Función para inicializar los campos con los datos de roles recibidos como parámetro
export const inicializarCampos = (rolesData) => {
  try {
    // Verificar que rolesData sea un array
    if (!Array.isArray(rolesData)) {
      return [...camposBase];
    }
    
    // Si el array está vacío, retornar campos base
    if (rolesData.length === 0) {
      return [...camposBase];
    }
    
    const roles = rolesData.map(r => ({ 
      id: r.id || r.Id, 
      nombre: r.nombre || r.Nombre 
    }));

    // Si no hay roles, retornar campos base
    if (roles.length === 0) {
      return [...camposBase];
    }

    // Retornar una copia profunda de los campos con las opciones cargadas
    const camposActualizados = camposBase.map((campo) => {
      if (campo.name === 'rol') {
        return { ...campo, options: roles };
      }
      return { ...campo };
    });
    
    return camposActualizados;
  } catch (error) {
    return [...camposBase];
  }
};

// Exportar campos base para compatibilidad
export const Campos = camposBase;
