import React, { useState } from 'react';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { boxDividerLine } from '../../styles/boxStyles';
import FiltroFechas from '../../components/FiltroFechas/FiltroFechas';
import HistorialTabLocal from './HistorialTabLocal';
import HistorialTabDeliveryTakeaway from './HistorialTabDeliveryTakeaway';
import HistorialTabReservas from './HistorialTabReservas';
import HistorialTabCajas from './HistorialTabCajas';

const TAB_LOCAL = 0;
const TAB_DELIVERY = 1;
const TAB_TAKEAWAY = 2;
const TAB_RESERVAS = 3;
const TAB_CAJAS = 4;

export default function Historial() {
    const [tabValue, setTabValue] = useState(0);
    const [filtroFechas, setFiltroFechas] = useState({
        fechaInicio: '',
        fechaFin: '',
        modoHistorico: false,
    });

    const handleTabChange = (_, newValue) => {
        setTabValue(newValue);
    };

    const handleBuscar = (fechaInicio, fechaFin) => {
        setFiltroFechas({
            fechaInicio,
            fechaFin,
            modoHistorico: false,
        });
    };

    const handleHistorico = () => {
        setFiltroFechas({
            fechaInicio: '',
            fechaFin: '',
            modoHistorico: true,
        });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Typography variant="h4" gutterBottom>
                Historial
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Consultá todos los historiales disponibles en el sistema.
            </Typography>
            <FiltroFechas
                onBuscar={handleBuscar}
                onHistorico={handleHistorico}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                El rango seleccionado impacta en todas las pestañas del historial.
            </Typography>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ ...boxDividerLine, mb: 2 }}
            >
                <Tab label="Local" icon={<TableRestaurantOutlinedIcon />} iconPosition="start" />
                <Tab label="Delivery" icon={<DeliveryDiningOutlinedIcon />} iconPosition="start" />
                <Tab label="Take Away" icon={<ShoppingBagOutlinedIcon />} iconPosition="start" />
                <Tab label="Reservas" icon={<EventNoteOutlinedIcon />} iconPosition="start" />
                <Tab label="Cajas" icon={<ReceiptOutlinedIcon />} iconPosition="start" />
            </Tabs>

            <Box role="tabpanel" hidden={tabValue !== TAB_LOCAL}>
                {tabValue === TAB_LOCAL && <HistorialTabLocal {...filtroFechas} />}
            </Box>
            <Box role="tabpanel" hidden={tabValue !== TAB_DELIVERY}>
                {tabValue === TAB_DELIVERY && <HistorialTabDeliveryTakeaway titulo="" tipo="delivery" {...filtroFechas} />}
            </Box>
            <Box role="tabpanel" hidden={tabValue !== TAB_TAKEAWAY}>
                {tabValue === TAB_TAKEAWAY && <HistorialTabDeliveryTakeaway titulo="" tipo="takeaway" {...filtroFechas} />}
            </Box>
            <Box role="tabpanel" hidden={tabValue !== TAB_RESERVAS}>
                {tabValue === TAB_RESERVAS && <HistorialTabReservas {...filtroFechas} />}
            </Box>
            <Box role="tabpanel" hidden={tabValue !== TAB_CAJAS}>
                {tabValue === TAB_CAJAS && <HistorialTabCajas {...filtroFechas} />}
            </Box>
        </Container>
    );
}
