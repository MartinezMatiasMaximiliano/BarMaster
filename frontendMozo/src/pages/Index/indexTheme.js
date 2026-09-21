import { createTheme } from '@mui/material/styles';
import baseTheme from '../../styles/theme';
import { brandColors } from '../../styles/brandTokens';

export const createIndexTheme = (mode) => {
    const isDarkMode = mode === 'dark';

    return createTheme(baseTheme, {
        palette: {
            mode,
            background: {
                default: isDarkMode ? brandColors.grey[1] : brandColors.grey[7],
                paper: isDarkMode ? brandColors.grey[2] : brandColors.grey[7],
            },
            text: {
                primary: isDarkMode ? brandColors.grey[7] : brandColors.grey[1],
                secondary: isDarkMode ? brandColors.primary.light : brandColors.grey[3],
                disabled: brandColors.grey[4],
            },
            divider: isDarkMode ? brandColors.grey[3] : brandColors.grey[5],
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    containedPrimary: {
                        color: brandColors.grey[1],
                        backgroundColor: brandColors.primary.main,
                        '&:hover': {
                            color: brandColors.grey[7],
                            backgroundColor: brandColors.primary.dark,
                        },
                    },
                },
            },
        },
    });
};
