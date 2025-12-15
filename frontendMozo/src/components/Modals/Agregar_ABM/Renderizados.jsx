import Input_Imagen from "../../Input_Imagen";
import Multiple_Select from "../../Select_Multiple";
import Select from "../../Select";
import { TextField } from "@mui/material";

export const Renderizados = (props, handleChange) => ({
  image: (campo, index) => (
    <Input_Imagen key={index} handleChange={handleChange} />
  ),
  select_multiple: (campo, index) => (
    <Multiple_Select
      key={index}
      campo={campo}
      itemsActivos={[]}
      handleChange={handleChange}
    />
  ),
  select: (campo, index) => (
    <Select
      key={index}
      datoActual=""
      campo={campo}
      handleChange={handleChange}
    />
  ),

  text: (campo, index) => (
    <TextField
      key={index}
      fullWidth
      label={campo.label}
      placeholder={`Ingrese valor para ${campo.label}`}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      variant="outlined"
    />
  ),
  "datetime-local": (campo, index) => (
    <TextField
      key={index}
      fullWidth
      label={campo.label}
      type="datetime-local"
      InputLabelProps={{ shrink: true }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      variant="outlined"
    />
  ),
  number: (campo, index) => (
    <TextField
      key={index}
      fullWidth
      label={campo.label}
      type="number"
      inputProps={{ min: 1 }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      variant="outlined"
    />
  ),
});