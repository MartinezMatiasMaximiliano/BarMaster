import { InputAdornment, TextField } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

export default function BuscadorTabla({ value, onChange, placeholder = 'Buscar...' }) {
    return (
        <TextField
            value={value}
            onChange={(event) => onChange(event.target.value)}
            label="Buscar"
            placeholder={placeholder}
            size="small"
            sx={{ width: { xs: '100%', sm: 300 } }}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchOutlinedIcon fontSize="small" />
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}
