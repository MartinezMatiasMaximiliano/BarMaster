import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert } from '@mui/material';
import { LoginContext, AuthTypeContext } from '../../App';
import { datosPrueba, datosFacturacion } from './utils/mockData';
import { useFacturacion } from './hooks/useFacturacion';
import Header from './components/Header';
import ConfirmExitDialog from './components/ConfirmExitDialog';
import PlanDialog from './components/PlanDialog';
import EmpresaCard from './components/EmpresaCard';

/**
 * Componente principal del Panel de Sucursales
 * Muestra todas las empresas y sus sucursales con información detallada
 */
function PanelSucursales() {
    const [empresas] = useState(datosPrueba);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openPlanDialog, setOpenPlanDialog] = useState(false);
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);

    const { desgloseFacturacion, totalCalculado } = useFacturacion(empresas);

    const handleAbrirConfirmacion = () => {
        setOpenConfirmDialog(true);
    };

    const handleCerrarConfirmacion = () => {
        setOpenConfirmDialog(false);
    };

    const handleAbrirPlanDialog = () => {
        setOpenPlanDialog(true);
    };

    const handleCerrarPlanDialog = () => {
        setOpenPlanDialog(false);
    };

    const handleSucursalEnter = (sucursal) => {
        // TODO: Implementar funcionalidad de entrada a la sucursal
        console.log('Entrando a sucursal:', sucursal);
    };

    return (
        <Box sx={{ 
            width: '100%', 
            minHeight: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            py: 2
        }}>
            <Header 
                onOpenPlanDialog={handleAbrirPlanDialog}
                onOpenConfirmDialog={handleAbrirConfirmacion}
            />

            <ConfirmExitDialog
                open={openConfirmDialog}
                onClose={handleCerrarConfirmacion}
                loginContext={loginContext}
                authTypeContext={authTypeContext}
                navigate={navigate}
            />

            <PlanDialog
                open={openPlanDialog}
                onClose={handleCerrarPlanDialog}
                datosFacturacion={datosFacturacion}
                desgloseFacturacion={desgloseFacturacion}
                totalCalculado={totalCalculado}
            />

            {empresas.length === 0 ? (
                <Alert 
                    severity="info" 
                    sx={{ 
                        mb: 3, 
                        width: '100%',
                        borderRadius: 2,
                        fontSize: '1rem',
                        py: 2
                    }}
                >
                    No se encontraron empresas con sucursales.
                </Alert>
            ) : (
                <Box sx={{ 
                    flexGrow: 1, 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    {empresas.map((empresa) => (
                        <EmpresaCard 
                            key={empresa.Id}
                            empresa={empresa}
                            onSucursalEnter={handleSucursalEnter}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default PanelSucursales;

