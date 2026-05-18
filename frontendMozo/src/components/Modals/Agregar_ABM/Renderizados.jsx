import Input_Imagen from "../../Input_Imagen";
import Multiple_Select from "../../Select_Multiple";
import Select from "../../Select";
import { TextField } from "@mui/material";
import { esCampoObligatorio } from "../../../Helpers/HelperFunctions";

function getFieldUiState(campo, errors = {}) {
  const fieldError = errors[campo.name];
  return {
    error: Boolean(fieldError),
    helperText: fieldError || campo.helperText || ' ',
  };
}

export const Renderizados = (props, handleChange, errors = {}) => ({
  image: (campo, index) => (
    <Input_Imagen
      key={index}
      handleChange={handleChange}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
    />
  ),
  select_multiple: (campo, index) => (
    <Multiple_Select
      key={index}
      campo={campo}
      itemsActivos={[]}
      handleChange={handleChange}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
    />
  ),
  select: (campo, index) => (
    <Select
      key={index}
      datoActual=""
      campo={campo}
      handleChange={handleChange}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
    />
  ),

  text: (campo, index) => (
    <TextField
      key={index}
      fullWidth
      required={esCampoObligatorio(campo)}
      label={campo.label}
      placeholder={`Ingrese valor para ${campo.label}`}
      inputProps={{ ...campo.inputProps }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
      variant="outlined"
    />
  ),
  "datetime-local": (campo, index) => (
    <TextField
      key={index}
      fullWidth
      required={esCampoObligatorio(campo)}
      label={campo.label}
      type="datetime-local"
      InputLabelProps={{ shrink: true }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
      variant="outlined"
    />
  ),
  number: (campo, index) => (
    <TextField
      key={index}
      fullWidth
      required={esCampoObligatorio(campo)}
      label={campo.label}
      type="number"
      inputProps={{ min: campo.min ?? 1, max: campo.max, ...campo.inputProps }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
      variant="outlined"
    />
  ),
  decimal: (campo, index) => (
    <TextField
      key={index}
      fullWidth
      required={esCampoObligatorio(campo)}
      label={campo.label}
      placeholder={campo.placeholder || `Ingrese valor para ${campo.label}`}
      inputProps={{ inputMode: "decimal", ...campo.inputProps }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
      variant="outlined"
    />
  ),
});
