import React from "react";
import { Button, TextField } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Input_Imagen(props) {
    const [fileName, setFileName] = React.useState('');
    const fileInputRef = React.useRef(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
        }
        props.handleChange(event, "imagen", "image");
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <TextField
                fullWidth
                label="Imagen"
                value={fileName}
                placeholder="Seleccione una imagen"
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        <Button
                            component="span"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            onClick={handleButtonClick}
                            sx={{ ml: 1 }}
                        >
                            Seleccionar
                        </Button>
                    )
                }}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default Input_Imagen;

