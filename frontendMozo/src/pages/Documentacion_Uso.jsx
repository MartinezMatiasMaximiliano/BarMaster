import React from 'react';
import { Box, Card, CardContent, CardHeader, Container, Typography } from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

const Documentacion_Uso = () => {
    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Card variant="outlined">
                <CardHeader title="Documentación de uso" />
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
                        <ArticleOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                            Próximamente
                        </Typography>
                        <Typography variant="body2" color="text.disabled" textAlign="center">
                            Estamos preparando la documentación para ayudarte a usar el sistema.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Documentacion_Uso;
