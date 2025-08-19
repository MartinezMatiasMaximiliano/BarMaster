import { useState, useContext } from 'react'
import connection from '../connections/HubConnCliente';
import { Paper, Typography, Container } from "@mui/material";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Modal_LlamarMozo from '../components/Modal_LlamarMozo';
import { LoginContext, NumeroMesaContext } from '../App.jsx'

function TopBar(props) {
    const logeadoProvider = useContext(LoginContext)
    const NumeroMesaProvider = useContext(NumeroMesaContext)

    return (
        <Paper sx={{position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99 }} elevation={1}>
            {logeadoProvider.logeado == true ?
                <Container sx={{display:'flex', alignItems:'center',justifyContent:'space-between'} }>
                    <Typography>Mesa: {NumeroMesaProvider.numeroMesa}</Typography>
                    <Typography>Estado:</Typography> {connection._connectionState === "Connected" ? 
                        <TaskAltIcon></TaskAltIcon>
                    :
                        <HighlightOffIcon></HighlightOffIcon>
                }
                    <Modal_LlamarMozo></Modal_LlamarMozo>
                </Container>
                :
                <Paper>
                    <Typography sx={{ml: 2} }>Ingrese el codigo provisto por su mozo</Typography>
                </Paper>
            }
        </Paper >
    )
}

export default TopBar;
