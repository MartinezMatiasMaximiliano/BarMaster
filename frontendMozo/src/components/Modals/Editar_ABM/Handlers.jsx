import { useState } from "react";
import { validarCampos } from "../../../Helpers/HelperFunctions";

export default function Handlers({ id, editValues, setEditValues, modificar, recargarComponentes, handleClose }) {
  
  const [errors, setErrors] = useState({});
  
  const fieldHandlers = {
    select_multiple: (event) => event.target.value,
    image: (event) => event.target.files[0],
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
    console.log("EDITVALUES: ", editValues)
    if (Object.keys(errors).length === 0) {
        await modificar({ ...editValues, id: id });
        setErrors({});
        handleClose();
        await recargarComponentes();
    }
  };

  return { errors, setErrors, handleChange, handleSave };
}
