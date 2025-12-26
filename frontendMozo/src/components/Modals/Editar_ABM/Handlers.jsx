import { useState } from "react";
import { validarCampos } from "../../../Helpers/HelperFunctions";

export default function Handlers({ id, editValues, setEditValues, modificar, recargarComponentes, handleClose }) {
  
  const [errors, setErrors] = useState({});
  
  const fieldHandlers = {
    select_multiple: (event) => event.target.value,
    image: (event) => event.target.files[0],
    "datetime-local": (event) => {
      const value = event.target.value;
      // Convertir datetime-local a ISO string con formato "2025-12-25T20:10:49.795Z"
      if (value) {
        // Crear Date desde el valor datetime-local (formato: YYYY-MM-DDTHH:mm)
        // El valor se interpreta como hora local
        const date = new Date(value);
        // toISOString() genera el formato correcto con milisegundos y Z
        return date.toISOString();
      }
      return value;
    },
    default: (event) => event.target.value,
  };

  const handleChange = (event, key, type = "default") => {
    const handler = fieldHandlers[type] || fieldHandlers.default;
    const valor = handler(event);

    setEditValues((prev) => ({
        ...prev,
        [key]: valor,
    }));

    validarCampos(key, valor, setErrors);
  };

  const handleSave = async () => {
    if (Object.keys(errors).length === 0) {
        await modificar({ ...editValues, id: id });
        setErrors({});
        handleClose();
        await recargarComponentes();
    }
  };

  return { errors, setErrors, handleChange, handleSave };
}
