import { useState } from "react";
import { validarCampos } from "../../../Helpers/HelperFunctions";

export default function Handlers({ agregar, recargarComponentes, handleClose, campos }) {
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({});

  const fieldHandlers = {
    select_multiple: (event) => event.target.value,
    select: (event) => {
      // Convertir cadena vacía a null para campos opcionales como idPlano
      const value = event.target.value;
      return value === '' ? null : value;
    },
    image: (event) => event.target.files[0],
    "datetime-local": (event) => {
      const value = event.target.value;
      // Convertir datetime-local a ISO string
      if (value) {
        return new Date(value).toISOString();
      }
      return value;
    },
    default: (event) => event.target.value,
  };

  const handleChange = (event, key, type = "default") => {
    const handler = fieldHandlers[type] || fieldHandlers.default;
    const valor = handler(event);
    setValues((prev) => ({ ...prev, [key]: valor }));
    validarCampos(key, valor, setErrors);
  };

  const handleSave = async () => {
    if (Object.keys(errors).length === 0) {
      try {
        await agregar(values);
        handleClose();
        await recargarComponentes();
      } catch (error) {
        setErrors(prev => ({ ...prev, servidor: error.message || 'Ocurrió un error. Intente nuevamente.' }));
      }
    }
  };

  return { errors, setErrors, handleChange, handleSave };
}
