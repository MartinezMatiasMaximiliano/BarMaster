import React, { useContext } from "react"
import { Card, CardContent, CardMedia, Typography, Box, CardActionArea } from "@mui/material";
import Alert from '@mui/material/Alert';
import CardActions from '@mui/material/CardActions';
import Modal_AgregarAPedido from '../components/Modal_AgregarAPedido';
import { LoginContext } from '../App'

function Producto({ producto }) {
    const ruta_imagen = import.meta.env.VITE_BASE_URL + producto.imagenUrl;
    const { logeado, setLogeado } = useContext(LoginContext);

    return (
        <Card sx={{
            display: "flex",
            marginBottom: 2,
            borderRadius: 3,
            boxShadow: 10,
            position: "relative",
            backgroundImage: `url(${ruta_imagen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '30vh',
            position: 'relative',
            color: 'white',
            overflow: 'hidden',
        }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)', // opacidad del fondo
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0 // Esto ayuda con el comportamiento de flex en algunos navegadores
                }}
            />
            <CardContent sx={{ flex: 1, p: 1, mt: ".5em", ml: ".5em", zIndex: 2}}>
                    <Typography variant="h6" fontWeight="bold">
                        {producto.nombre}
                    </Typography>
                    <Typography variant="body2">
                        {producto.descripcion}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'precio.color_precio' }}>
                        ${producto.precio}
                    </Typography>
                    {logeado &&
                    <CardActions sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1
                    }}>
                            <Modal_AgregarAPedido producto={producto} />
                        </CardActions>
                    }
                </CardContent>
           
        </Card>
    );
};

export default Producto;


