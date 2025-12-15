import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import { gradientPrimary, gradientButtonStylesWithTransform } from '../../../styles/buttonStyles';

/**
 * Componente Header del Panel de Sucursales
 * Muestra el título y los botones de acción principales
 */
const Header = ({ onOpenPlanDialog, onOpenConfirmDialog }) => {
    return (
        <Box sx={{ 
            mb: 4, 
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2
        }}>
            <Box sx={{ flexGrow: 1 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 700,
                        background: gradientPrimary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}
                >
                    Panel de Sucursales
                </Typography>
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ fontSize: '1.1rem' }}
                >
                    Administra y visualiza todas tus sucursales
                </Typography>
            </Box>
            
            <Stack direction="row" spacing={2} alignItems="center">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={onOpenPlanDialog}
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        ...gradientButtonStylesWithTransform
                    }}
                >
                    Mi Plan
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={onOpenConfirmDialog}
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderWidth: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                            bgcolor: 'error.light',
                            color: 'error.dark'
                        }
                    }}
                >
                    Salir
                </Button>
            </Stack>
        </Box>
    );
};

export default Header;

