import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import { LoginContext, AuthTypeContext } from '../../App';
import { ObtenerEmpresaConSucursales } from '../../API/APIEmpresas';
import { useFacturacion } from './hooks/useFacturacion';
import Header from './components/Header';
import ConfirmExitDialog from './components/ConfirmExitDialog';
import PlanDialog from './components/PlanDialog';
import EmpresaCard from './components/EmpresaCard';

function PanelSucursales() {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openPlanDialog, setOpenPlanDialog] = useState(false);
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);

    const { desgloseFacturacion, totalCalculado } = useFacturacion(empresas);

    useEffect(() => {
        ObtenerEmpresaConSucursales()
            .then(data => {
                setEmpresas(Array.isArray(data) ? data : [data]);
            })
            .catch(() => {
                setError('No se pudo cargar la información de las sucursales.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSucursalEnter = (sucursal, idEmpresa) => {
        navigate(`/sucursal/${idEmpresa}/${sucursal.id}`);
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
                onOpenPlanDialog={() => setOpenPlanDialog(true)}
                onOpenConfirmDialog={() => setOpenConfirmDialog(true)}
            />

            <ConfirmExitDialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                loginContext={loginContext}
                authTypeContext={authTypeContext}
                navigate={navigate}
            />

            <PlanDialog
                open={openPlanDialog}
                onClose={() => setOpenPlanDialog(false)}
                desgloseFacturacion={desgloseFacturacion}
                totalCalculado={totalCalculado}
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            ) : empresas.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
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
                            key={empresa.id}
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
