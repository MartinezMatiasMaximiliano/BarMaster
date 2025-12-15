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
  "datetime-local": (campo, value, index) => {
    // Convertir ISO string a datetime-local format (YYYY-MM-DDTHH:mm)
    let localValue = "";
    if (value) {
      try {
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        localValue = `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (e) {
        console.error("Error converting date:", e);
      }
    }
    return (
      <TextField
        key={index}
        fullWidth
        label={campo.label}
        type="datetime-local"
        value={localValue}
        InputLabelProps={{ shrink: true }}
        onChange={(e) => handleChange(e, campo.name, campo.type)}
        variant="outlined"
      />
    );
  },
  number: (campo, value, index) => (
    <TextField
      key={index}
      fullWidth
      label={campo.label}
      type="number"
      value={value || ""}
      inputProps={{ min: 1 }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      variant="outlined"
    />
  ),
});
