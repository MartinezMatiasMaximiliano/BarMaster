import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

const KpiTile = ({ icon, label, value, helper, color = 'text.primary' }) => {
    return (
        <Box
            sx={{
                minWidth: 0,
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, minWidth: 0 }}>
                {icon}
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    {label}
                </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, color, lineHeight: 1.2, overflowWrap: 'anywhere' }}>
                {value}
            </Typography>
            {helper && (
                <Typography variant="caption" color="text.secondary">
                    {helper}
                </Typography>
            )}
        </Box>
    );
};

export default KpiTile;
