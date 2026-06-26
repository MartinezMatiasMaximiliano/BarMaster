import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { LoginContext, AuthTypeContext } from '../../App';
import Header from './components/Header';
import ConfirmExitDialog from './components/ConfirmExitDialog';
import PanelResumenHeader from './components/PanelResumenHeader';
import PlanDialog from './components/PlanDialog';
import SucursalPerformanceCard from './components/SucursalPerformanceCard';
import { usePanelSucursalesData } from './hooks/usePanelSucursalesData';

function PanelSucursales() {
    const [periodoDias, setPeriodoDias] = useState(7);
    const [expandedSucursalId, setExpandedSucursalId] = useState(undefined);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openPlanDialog, setOpenPlanDialog] = useState(false);
    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);
    const authTypeContext = useContext(AuthTypeContext);

    const {
        cargarDatos,
        desgloseFacturacion,
        error,
        loading,
        resumen,
        sucursales,
        totalCalculado,
        totales
    } = usePanelSucursalesData(periodoDias);

    useEffect(() => {
        const expandedExiste = sucursales.some(s => s.id === expandedSucursalId);

        if (expandedSucursalId === undefined && sucursales.length > 0) {
            setExpandedSucursalId(sucursales[0].id);
            return;
        }

        if (expandedSucursalId && !expandedExiste && sucursales.length > 0) {
            setExpandedSucursalId(sucursales[0].id);
        }
    }, [expandedSucursalId, sucursales]);

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

            <PanelResumenHeader
                empresaNombre={resumen?.empresaNombre}
                periodoDias={periodoDias}
                totalSucursales={sucursales.length}
                totales={totales}
                onPeriodoChange={setPeriodoDias}
                onActualizar={cargarDatos}
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            ) : !sucursales.length ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No se encontraron sucursales para mostrar.
                </Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sucursales.map((sucursal) => (
                        <SucursalPerformanceCard
                            key={sucursal.id}
                            sucursal={sucursal}
                            expanded={expandedSucursalId === sucursal.id}
                            onToggle={() => setExpandedSucursalId(prev => prev === sucursal.id ? null : sucursal.id)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default PanelSucursales;
