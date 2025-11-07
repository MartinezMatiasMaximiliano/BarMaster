import { useState } from "react";
import { validarCampos } from "../../../Helpers/HelperFunctions";

export default function Handlers({ agregar, recargarComponentes, handleClose }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (event, key) => {
    let valor;
    if (key === "rol" || key === "Envio") {
      valor = { id: event.target.value, nombre: "" };
    } else if (key === "imagen") {
      valor = event.target.files[0];
    } else {
      valor = event.target.value;
    }

    setValues((prev) => ({ ...prev, [key]: valor }));
    validarCampos(key, valor, setErrors);
  };

  const handleSave = async () => {
    if (Object.keys(errors).length === 0) {
      await agregar(values);
      handleClose();
      await recargarComponentes();
    }
  };

  return { values, errors, setErrors, handleChange, handleSave };
}
