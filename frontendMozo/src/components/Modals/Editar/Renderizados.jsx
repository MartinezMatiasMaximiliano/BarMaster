// src/components/Modals/Modal_Editar/Renderizados_Editar.jsx
import Input_Imagen from "../../Input_Imagen";
import Multiple_Select from "../../Select_Multiple";
import Select from "../../Select";
import { Form } from "react-bootstrap";

export const Renderizados = (props, handleChange) => ({
  image: (campo, index) => (
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
    <Form.Group className="mb-3" key={index}>
      <Form.Label>{campo.label}</Form.Label>
      <Form.Control
        type="text"
        value={value || ""}
        placeholder={`Ingrese valor para ${campo.label}`}
        onChange={(e) => handleChange(e, campo.name, campo.type)}
      />
    </Form.Group>
  ),
});
