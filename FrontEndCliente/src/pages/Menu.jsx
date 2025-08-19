import React, { useState, useEffect, useContext } from "react"
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Container from '@mui/material/Container';
import { Box, Stack, Slide } from "@mui/material";
import Producto from "../components/Producto";
import Filtro from "../components/Filtro";
import { BuscarTodosLosProductos } from '../API/APIProductos'
import { BuscarTodasLasCategorias } from "../API/APICategorias"


function Menu(props) {
    const [menuCompleto, setMenuCompleto] = useState([])
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([])
    const [filtrosActivos, setFiltrosActivos] = useState([])
    const [inputBusqueda, setInputBusqueda] = React.useState('');
    const theme = useTheme()

    useEffect(() => {
        const fetch = async () => {
            BuscarTodosLosProductos().then((data) => { setMenuCompleto(data); setProductosFiltrados(data) }).catch(error => null)
            BuscarTodasLasCategorias().then(data => { const categoriasActivas = data.filter(categoria => categoria.activo === true); setCategorias(categoriasActivas) }).catch(error => null)
        }
        fetch()
    }, [])

    /*setProductosFiltrados(() => { })*/
    const filtrarProductos = () => {
        //menuCompleto.filter(item => {
        //    const matchesString = busqueda
        //        ? item.nombre.toLowerCase().includes(busqueda.toLowerCase())
        //        : true;

        //    const matchesCategories = filtrosActivos?.length
        //        ? item.categorias.every(cat => item.categorias.includes(cat))
        //        : true;

        //    return matchesString && matchesCategories;
        //})
    }

    useEffect(() => {
        let filtrado = menuCompleto.filter((producto) => producto.activo === true);

        // Filtrar por input de búsqueda si hay texto
        if (inputBusqueda.length > 0) {
            filtrado = filtrado.filter(prod =>
                prod.nombre.toLowerCase().includes(inputBusqueda.toLowerCase()) ||
                prod.descripcion.toLowerCase().includes(inputBusqueda.toLowerCase())
            );
        }

        // Filtrar por filtros activos si hay alguno
        if (filtrosActivos.length > 0) {
            filtrado = filtrado.filter(prod =>
                filtrosActivos.some(filtro => prod.categorias.includes(filtro))
            );
        }

        setProductosFiltrados(filtrado);
    }, [inputBusqueda, filtrosActivos, menuCompleto]);

    const handleClickFiltros = (e) => {
        if (filtrosActivos.includes(e)) { // Si el filtro ya habia sido seleccionado, se lo quita
            setFiltrosActivos(filtrosActivos.filter(elem => elem != e))
        } else { // Si el filtro no estaba seleccionado, se lo agrega
            setFiltrosActivos(prevFiltro => { return [...prevFiltro, e] });
        }
    }


    const listaElementos = productosFiltrados.map((producto, i) => <Producto key={i} producto={producto} />)
    const listaNombres = productosFiltrados.map(item => item.nombre)
    const listaFiltros = categorias.map((categoria, i) => <Filtro key={i} clave={categoria.id} valor={categoria.nombre} handleFiltrosActivos={handleClickFiltros} />)

    return (
        <>
            <Box
                component="img"
                src="/logo.webp"
                alt="Descriptive text"
                sx={{
                    m:0,
                    display:'flex',
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    height:'400px',
                    objectFit: 'cover',
                    justifyContent: 'center',
                    zIndex:-1,
                }}
            />
            <Container sx={{ m: 0,borderRadius:5, marginBottom: 0, p: 0,mt:'350px',zIndex:2,bgcolor:'white' }} >
                <Container sx={{ m: 0, p: "1em" }} >
                    <Autocomplete
                        disablePortal
                        options={listaNombres}
                        sx={{ width: "100%" }}
                        renderInput={(params) => <TextField {...params} label="Buscar comidas" />}
                        inputValue={inputBusqueda}
                        onInputChange={(event, newInputValue) => {
                            setInputBusqueda(newInputValue);
                        }}
                    />
                </Container >
                <Container sx={{ m: 0, p: 0 }}>
                    <Box sx={{ display: "flex", overflowX: "auto", whiteSpace: "nowrap", "&::-webkit-scrollbar": { display: "show" }, gap: 1, m: 0, p: 1 }}>
                        {listaFiltros}
                    </Box>
                </Container>
                <Container sx={{ marginBottom: 5, padding: 1 }}>
                    {listaElementos}
                </Container>
            </Container>
        </>
    )
}
export default Menu;
