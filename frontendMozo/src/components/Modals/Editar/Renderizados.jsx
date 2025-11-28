// src/components/Modals/Modal_Editar/Renderizados_Editar.jsx
import Input_Imagen from "../../Input_Imagen";
import Multiple_Select from "../../Select_Multiple";
import Select from "../../Select";
import { TextField } from "@mui/material";

export const Renderizados = (props, handleChange) => ({
  image: (campo, value, index) => (
    <Input_Imagen
      key={index}
      handleChange={handleChange}
    />
  ),

  select_multiple: (campo, value, index) => (
    <Multiple_Select
      key={index}
      campo={campo}
      itemsTotales={props.categoriasTotales}
      itemsActivos={value || []}
      handleChange={handleChange}
    />
  ),

  select: (campo, value, index) => (
    <Select
      key={index}
      campo={campo}
      datoActual={value}
      handleChange={handleChange}
    />
  ),

  text: (campo, value, index) => (
    <TextField
      key={index}
      fullWidth
      label={campo.label}
      value={value || ""}
      placeholder={`Ingrese valor para ${campo.label}`}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      variant="outlined"
    />
  ),
});
