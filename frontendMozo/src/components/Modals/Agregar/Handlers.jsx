import { useState } from "react";
import { validarCampos } from "../../../Helpers/HelperFunctions";

export default function Handlers({ agregar, recargarComponentes, handleClose }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const fieldHandlers = {
    select: (event) => ({ id: event.target.value, nombre: "" }),
    select_multiple: (event) => event.target.value,
    image: (event) => event.target.files[0],
    default: (event) => event.target.value,
  };

  const handleChange = (event, key, type = "default") => {
    const handler = fieldHandlers[type] || fieldHandlers.default;
    const valor = handler(event);
    console.log("VALOR", valor)

    setValues((prev) => ({ ...prev, [key]: valor }));

    validarCampos(key, valor, setErrors);
  };

  const handleSave = async () => {
    if (Object.keys(errors).length === 0) {
      console.log("VALUES: ", values)
      await agregar(values);
      handleClose();
      await recargarComponentes();
    }
  };

  return { values, errors, setErrors, handleChange, handleSave };
}
