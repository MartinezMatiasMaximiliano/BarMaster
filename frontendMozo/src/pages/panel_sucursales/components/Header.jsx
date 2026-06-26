import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';

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
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 0.5
                    }}
                >
                    Panel de Sucursales
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Desempeño operativo claro para decidir rápido
                </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={onOpenPlanDialog}
                    sx={{
                        px: 2.5,
                        py: 1,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
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
                        px: 2.5,
                        py: 1,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Salir
                </Button>
            </Stack>
        </Box>
    );
};

export default Header;
