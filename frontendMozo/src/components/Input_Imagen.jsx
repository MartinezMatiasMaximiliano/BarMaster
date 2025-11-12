import React from "react";
import { Form, Button } from "react-bootstrap";
function Input_Imagen(props) {
    const handleImageChange = (event) => {
        props.handleChange(event, "imagen", "image");
    };

    return (
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Subir imagen</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
            </Form.Group>
    );
}

export default Input_Imagen;

