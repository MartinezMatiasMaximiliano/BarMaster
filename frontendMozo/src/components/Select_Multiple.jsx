import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(name, personName, theme) {
    return {
        fontWeight: personName.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

export default function Select_Multiple(props) {
    const theme = useTheme();
    const [categoriasActuales, setCategoriasActuales] = React.useState(props.categoriasActuales);
    const categoriasActivos = props.categorias.filter(cat => cat.activo == true);
    const categorias = categoriasActivos.map((categoria) => categoria.nombre); // Se convierte el objeto en un arreglo

    const handleChange = (event) => {
        props.handleChange(event, "categorias");
        const {
            target: { value },
        } = event;
        setCategoriasActuales(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <div>
            <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="demo-multiple-chip-label">{props.titulo}</InputLabel>
                <Select
                    labelId="demo-multiple-chip-label"
                    id="demo-multiple-chip"
                    multiple
                    value={categoriasActuales}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label={props.titulo} />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {categorias.map((cat) => (
                        <MenuItem
                            key={cat}
                            value={cat}
                            style={getStyles(cat, categoriasActuales, theme)}
                        >
                            {cat}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}

