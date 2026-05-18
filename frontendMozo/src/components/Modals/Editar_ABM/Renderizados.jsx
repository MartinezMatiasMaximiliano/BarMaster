// src/components/Modals/Modal_Editar/Renderizados_Editar.jsx
import Input_Imagen from "../../Input_Imagen";
import Multiple_Select from "../../Select_Multiple";
import Select from "../../Select";
import { InputAdornment, TextField, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { esCampoObligatorio } from "../../../Helpers/HelperFunctions";

function buildInputProps(campo) {
  const inputProps = { ...(campo.InputProps || {}) };

  if (campo.endAdornmentText || campo.infoTooltip) {
    inputProps.endAdornment = (
      <InputAdornment position="end">
        {campo.endAdornmentText || null}
        {campo.infoTooltip ? (
          <Tooltip title={campo.infoTooltip}>
            <InfoOutlinedIcon
              fontSize="small"
              color="action"
              sx={{ ml: campo.endAdornmentText ? 0.5 : 0 }}
            />
          </Tooltip>
        ) : null}
      </InputAdornment>
    );
  }

  return Object.keys(inputProps).length > 0 ? inputProps : undefined;
}

function getFieldUiState(campo, errors = {}) {
  const fieldError = errors[campo.name];
  return {
    error: Boolean(fieldError),
    helperText: fieldError || campo.helperText || ' ',
  };
}

export const Renderizados = (props, handleChange, errors = {}) => ({
  image: (campo, value, index) => (
    <Input_Imagen
      key={index}
      handleChange={handleChange}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
    />
  ),

  select_multiple: (campo, value, index) => (
    <Multiple_Select
      key={index}
      campo={campo}
      itemsActivos={value || []}
      handleChange={handleChange}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
    />
  ),

  select: (campo, value, index) => (
    <Select
      key={index}
      campo={campo}
      datoActual={value}
      handleChange={handleChange}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
    />
  ),

  text: (campo, value, index) => (
    <TextField
      key={index}
      fullWidth
      required={esCampoObligatorio(campo)}
      label={campo.label}
      value={value ?? ""}
      placeholder={campo.placeholder || `Ingrese valor para ${campo.label}`}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
      InputProps={buildInputProps(campo)}
      inputProps={{ ...campo.inputProps }}
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
        required={esCampoObligatorio(campo)}
        label={campo.label}
        type="datetime-local"
        value={localValue}
        InputLabelProps={{ shrink: true }}
        onChange={(e) => handleChange(e, campo.name, campo.type)}
        error={getFieldUiState(campo, errors).error}
        helperText={getFieldUiState(campo, errors).helperText}
        variant="outlined"
      />
    );
  },
  number: (campo, value, index) => (
    <TextField
      key={index}
      fullWidth
      required={esCampoObligatorio(campo)}
      label={campo.label}
      type="number"
      value={value ?? ""}
      placeholder={campo.placeholder}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
      InputProps={buildInputProps(campo)}
      inputProps={{ min: campo.min ?? 1, max: campo.max, ...campo.inputProps }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      variant="outlined"
    />
  ),
  decimal: (campo, value, index) => (
    <TextField
      key={index}
      fullWidth
      required={esCampoObligatorio(campo)}
      label={campo.label}
      value={value ?? ""}
      placeholder={campo.placeholder || `Ingrese valor para ${campo.label}`}
      error={getFieldUiState(campo, errors).error}
      helperText={getFieldUiState(campo, errors).helperText}
      InputProps={buildInputProps(campo)}
      inputProps={{ inputMode: "decimal", ...campo.inputProps }}
      onChange={(e) => handleChange(e, campo.name, campo.type)}
      variant="outlined"
    />
  ),
});
