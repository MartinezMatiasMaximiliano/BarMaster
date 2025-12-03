import { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

export const LoadingWrapper = ({ 
    children, 
    delay = 500,
    size = 60, 
    minHeight = 400,
    ...boxProps 
}) => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    if (!showContent) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight,
                    flex: 1,
                    ...boxProps.sx
                }}
                {...boxProps}
            >
                <CircularProgress size={size} />
            </Box>
        );
    }

    return children;
};

