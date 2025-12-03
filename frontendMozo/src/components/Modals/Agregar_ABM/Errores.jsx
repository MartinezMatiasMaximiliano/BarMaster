import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material';

export default function Errores({errors}) {
    if (!errors || Object.keys(errors).length === 0) return null;
    return (
        <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Errores en el formulario</AlertTitle>
            <List dense sx={{ py: 0 }}>
                {Object.entries(errors).map(([key, value]) => (
                    <ListItem key={key} sx={{ py: 0.5 }}>
                        <ListItemText 
                            primary={
                                <>
                                    Campo <strong>{key}</strong>: {value}
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Alert>
    )
}