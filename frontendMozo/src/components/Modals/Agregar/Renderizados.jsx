import Input_Imagen from "../../Input_Imagen";
import Multiple_Select from "../../Select_Multiple";
import Select from "../../Select";
import { Form } from "react-bootstrap";

export const Renderizados = (props, handleChange) => ({
  image: (campo, index) => (
    <Input_Imagen key={index} handleChange={handleChange} />
  ),
  select_multiple: (campo, index) => (
    <Multiple_Select
      key={index}
      itemsTotales={campo.options}
      titulo={campo.label}
      itemsActivos={[]}
      handleChange={handleChange}
    />
  ),
  select: (campo, index) => (
    <Select
      key={index}
      datos_select={campo.options}
      datoActual=""
      titulo={campo.label}
      name={campo.name}
      handleChange={handleChange}
    />
  ),

  text: (campo, index) => (
    <Form.Group className="mb-3" key={index} controlId={`campo-${index}`}>
      <Form.Label>{campo.label}</Form.Label>
      <Form.Control
        type="text"
        placeholder={`Ingrese valor para ${campo.label}`}
        onChange={(e) => handleChange(e, col)}
      />
    </Form.Group>
  ),
});