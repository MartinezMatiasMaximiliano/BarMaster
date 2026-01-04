import { BuscarTodosLosRoles } from "../../API/APIRoles";

const camposBase = [
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "apellido", label: "Apellido", type: "text" },
  { name: "dni", label: "DNI", type: "text" },
  { name: "direccion", label: "Dirección", type: "text" },
  { name: "telefono", label: "Teléfono", type: "text" },
  { name: "rol", label: "Rol", type: "select", options: [] },
];

// Función para inicializar los campos con los datos de roles
export const inicializarCampos = async () => {
  try {
    const data = await BuscarTodosLosRoles();
    
    // Verificar que data sea un array
    if (!Array.isArray(data)) {
      console.error("Los datos de roles no son un array:", data);
      return camposBase;
    }
    
    const roles = data
      .filter(r => r.activo === true || r.activo === undefined)
      .map(r => ({ 
        id: r.id || r.Id, 
        nombre: r.nombre || r.Nombre 
      }));

    // Retornar una copia de los campos con las opciones cargadas
    return camposBase.map((campo, index) => 
      index === 5 ? { ...campo, options: roles } : campo
    );
  } catch (error) {
    console.error("Error al cargar roles:", error);
    return camposBase;
  }
};

// Exportar campos base para compatibilidad
export const Campos = camposBase;