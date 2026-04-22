import { Alert, AlertTitle } from '@mui/material';

export default function Errores({errors}) {
    if (!errors?.servidor) return null;
    return (
        <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>No se pudo guardar</AlertTitle>
            {errors.servidor}
        </Alert>
    )
}
