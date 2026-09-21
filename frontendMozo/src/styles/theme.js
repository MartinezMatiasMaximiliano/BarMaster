import { createTheme } from '@mui/material/styles';
import { brandColors } from './brandTokens';

const fontPrincipal = '"Stack Sans Headline", Arial, sans-serif';
const fontAcento = 'Domine, Georgia, serif';

const theme = createTheme({
    palette: {
        common: { black: brandColors.grey[1], white: brandColors.grey[7] },
        primary: { ...brandColors.primary, contrastText: brandColors.grey[1] },
        secondary: { ...brandColors.secondary, contrastText: brandColors.grey[1] },
        info: { ...brandColors.secondary, contrastText: brandColors.grey[1] },
        success: { ...brandColors.success, contrastText: brandColors.grey[1] },
        warning: { ...brandColors.warning, contrastText: brandColors.grey[1] },
        error: { ...brandColors.error, contrastText: brandColors.grey[1] },
        text: {
            primary: brandColors.grey[1],
            secondary: brandColors.grey[3],
            disabled: brandColors.grey[4]
        },
        divider: brandColors.grey[5],
        background: {
            default: brandColors.grey[6],
            paper: brandColors.grey[7]
        },
        grey: {
            50: brandColors.grey[7],
            100: brandColors.grey[7],
            200: brandColors.grey[6],
            300: brandColors.grey[5],
            400: brandColors.grey[5],
            500: brandColors.grey[4],
            600: brandColors.grey[4],
            700: brandColors.grey[3],
            800: brandColors.grey[2],
            900: brandColors.grey[1]
        },
        action: {
            hover: 'rgba(112, 152, 250, 0.10)',
            selected: 'rgba(112, 152, 250, 0.18)',
            focus: 'rgba(112, 152, 250, 0.22)',
            disabledBackground: brandColors.grey[5]
        }
    },
    typography: {
        fontFamily: fontPrincipal,
        fontWeightLight: 200,
        fontWeightRegular: 200,
        fontWeightMedium: 500,
        fontWeightBold: 500,
        h1: { fontWeight: 500 },
        h2: { fontWeight: 500 },
        h3: { fontWeight: 500 },
        h4: { fontWeight: 500 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500 },
        button: { fontWeight: 500, textTransform: 'none' }
    },
    shape: { borderRadius: 10 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                ':root': {
                    '--bm-primary': brandColors.primary.main,
                    '--bm-primary-dark': brandColors.primary.dark,
                    '--bm-primary-light': brandColors.primary.light,
                    '--bm-secondary': brandColors.secondary.main,
                    '--bm-secondary-dark': brandColors.secondary.dark,
                    '--bm-secondary-light': brandColors.secondary.light,
                    '--bm-success': brandColors.success.main,
                    '--bm-success-dark': brandColors.success.dark,
                    '--bm-success-light': brandColors.success.light,
                    '--bm-warning': brandColors.warning.main,
                    '--bm-warning-dark': brandColors.warning.dark,
                    '--bm-warning-light': brandColors.warning.light,
                    '--bm-error': brandColors.error.main,
                    '--bm-error-dark': brandColors.error.dark,
                    '--bm-error-light': brandColors.error.light,
                    '--bm-grey-01': brandColors.grey[1],
                    '--bm-grey-02': brandColors.grey[2],
                    '--bm-grey-03': brandColors.grey[3],
                    '--bm-grey-04': brandColors.grey[4],
                    '--bm-grey-05': brandColors.grey[5],
                    '--bm-grey-06': brandColors.grey[6],
                    '--bm-grey-07': brandColors.grey[7],
                    '--bm-font-primary': fontPrincipal,
                    '--bm-font-accent': fontAcento
                },
                body: {
                    margin: 0,
                    color: brandColors.grey[1],
                    backgroundColor: brandColors.grey[6],
                    fontFamily: fontPrincipal,
                    fontWeight: 200
                },
                'strong, b': { fontWeight: 500 }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8 },
                contained: {
                    color: brandColors.grey[7],
                    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                        color: 'inherit'
                    }
                },
                containedPrimary: {
                    color: brandColors.grey[7],
                    backgroundColor: brandColors.primary.dark,
                    '&:hover': {
                        backgroundColor: brandColors.primary.dark,
                        boxShadow: '0 4px 14px rgba(59, 95, 217, 0.35)'
                    }
                },
                containedSecondary: {
                    color: brandColors.grey[7],
                    backgroundColor: brandColors.secondary.main,
                    '&:hover': { backgroundColor: brandColors.secondary.dark }
                },
                containedSuccess: {
                    color: brandColors.grey[7],
                    backgroundColor: brandColors.success.dark,
                    '&:hover': { backgroundColor: brandColors.success.dark }
                },
                containedWarning: {
                    color: brandColors.grey[7],
                    backgroundColor: brandColors.warning.dark,
                    '&:hover': { backgroundColor: brandColors.warning.dark }
                },
                containedError: {
                    color: brandColors.grey[7],
                    backgroundColor: brandColors.error.dark,
                    '&:hover': { backgroundColor: brandColors.error.dark }
                },
                containedInfo: {
                    color: brandColors.grey[7],
                    backgroundColor: brandColors.secondary.dark,
                    '&:hover': { backgroundColor: brandColors.secondary.dark }
                },
                outlinedPrimary: {
                    color: brandColors.primary.dark,
                    borderColor: brandColors.primary.dark,
                    '&:hover': {
                        borderColor: brandColors.primary.dark,
                        backgroundColor: brandColors.primary.light
                    }
                }
            }
        },
        MuiDialogTitle: { styleOverrides: { root: { fontWeight: 500 } } },
        MuiInputLabel: { styleOverrides: { root: { fontWeight: 500 } } },
        MuiChip: {
            styleOverrides: {
                root: {
                    color: brandColors.success.dark,
                    backgroundColor: 'transparent',
                    borderColor: brandColors.success.dark,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    '& .MuiChip-icon, & .MuiChip-deleteIcon': {
                        color: brandColors.success.dark
                    }
                },
                colorError: {
                    color: brandColors.error.main,
                    backgroundColor: 'transparent',
                    borderColor: brandColors.error.main,
                    '& .MuiChip-icon, & .MuiChip-deleteIcon': {
                        color: brandColors.error.main
                    }
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: { fontWeight: 200 },
                head: { fontWeight: 200 }
            }
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    color: brandColors.grey[7],
                    '& .MuiSvgIcon-root': { color: 'inherit' }
                }
            }
        },
        MuiAlert: {
            styleOverrides: {
                standardSuccess: {
                    color: brandColors.success.dark,
                    backgroundColor: brandColors.success.light
                },
                standardWarning: {
                    color: brandColors.warning.dark,
                    backgroundColor: brandColors.warning.light,
                    '& .MuiAlert-icon': { color: brandColors.warning.dark }
                },
                standardError: {
                    color: brandColors.error.dark,
                    backgroundColor: brandColors.error.light
                }
            }
        },
        MuiLink: { styleOverrides: { root: { color: brandColors.primary.dark } } }
    }
});

export default theme;
