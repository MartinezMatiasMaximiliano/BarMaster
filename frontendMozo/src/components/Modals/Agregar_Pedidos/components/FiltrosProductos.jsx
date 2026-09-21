import { Stack, Autocomplete, TextField } from '@mui/material';

export const FiltrosProductos = ({ 
    busquedaInputRef,
    productos, 
    categorias, 
    busqueda, 
    categoriaFiltro, 
    onBusquedaChange, 
    onBusquedaFocus,
    onBusquedaBlur,
    onCategoriaChange 
}) => {
    return (
        <Stack direction="row" spacing={2}>
            <Autocomplete
                freeSolo
                options={productos.map(p => p.nombre)}
                value={busqueda}
                onInputChange={(event, newValue) => onBusquedaChange(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        inputRef={busquedaInputRef}
                        autoFocus={Boolean(busquedaInputRef)}
                        label="Buscar productos"
                        variant="outlined"
                        size="small"
                        onFocus={onBusquedaFocus}
                        onBlur={onBusquedaBlur}
                    />
                )}
                sx={{ flex: 1 }}
            />
            <Autocomplete
                options={categorias}
                getOptionLabel={(option) => option.nombre}
                value={categoriaFiltro}
                onChange={(event, newValue) => onCategoriaChange(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Categoría"
                        variant="outlined"
                        size="small"
                    />
                )}
                sx={{ width: 200 }}
            />
        </Stack>
    );
};

