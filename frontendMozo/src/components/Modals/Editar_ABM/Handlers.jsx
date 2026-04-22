import { useState } from "react";
import { validarCampos, validarFormulario } from "../../../Helpers/HelperFunctions";

export default function Handlers({ id, editValues, setEditValues, modificar, recargarComponentes, handleClose, campos }) {
  
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
    const campo = campos.find((item) => item.name === key);
    const handler = fieldHandlers[type] || fieldHandlers.default;
    const valor = handler(event);

    setEditValues((prev) => ({
        ...prev,
        [key]: valor,
    }));

    validarCampos(key, valor, setErrors, campo);
  };

  const handleSave = async () => {
    const erroresFormulario = validarFormulario(campos, editValues);
    if (Object.keys(erroresFormulario).length > 0) {
        setErrors(erroresFormulario);
        return;
    }

    try {
        await modificar({ ...editValues, id: id });
        setErrors({});
        handleClose();
        await recargarComponentes();
    } catch (error) {
        setErrors(prev => ({ ...prev, servidor: error.message || 'Ocurrió un error. Intente nuevamente.' }));
    }
  };

  return { errors, setErrors, handleChange, handleSave };
}
