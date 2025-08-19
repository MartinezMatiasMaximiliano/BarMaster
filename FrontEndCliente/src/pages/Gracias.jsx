import React from 'react';
import { Box, Container } from '@mui/material';

export default function Gracias() {
    return (
        <Container
            maxWidth="sm"
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            <Box component="img" src="/gracias.png" alt="Gracias por visitarnos" sx={{ width: '100%', borderRadius: 2 }} />
        </Container>
    );
}

