/**
 * Estilos compartidos para botones con gradiente
 * Reutilizables en todo el sistema
 */

// Gradiente principal usado en botones y otros elementos
export const gradientPrimary = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
export const gradientPrimaryHover = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';

// Sombra del botón
export const buttonShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
export const buttonShadowHover = '0 6px 20px rgba(102, 126, 234, 0.6)';

/**
 * Estilo completo para botón con gradiente (versión estándar)
 * Incluye todos los estilos necesarios para el botón con efecto hover
 */
export const gradientButtonStyles = {
    textTransform: 'none',
    fontWeight: 600,
    px: 3,
    background: gradientPrimary,
    boxShadow: buttonShadow,
    '&:hover': {
        background: gradientPrimaryHover,
        boxShadow: buttonShadowHover,
    }
};

/**
 * Estilo completo para botón con gradiente (versión con transformación en hover)
 * Incluye efecto de elevación adicional
 */
export const gradientButtonStylesWithTransform = {
    ...gradientButtonStyles,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        ...gradientButtonStyles['&:hover'],
        transform: 'translateY(-2px)',
    },
    '&:active': {
        transform: 'translateY(0)',
    }
};

/**
 * Estilos para botones de cancelar
 * Usado en modales y diálogos
 */
export const cancelButtonStyles = {
    textTransform: 'none',
    fontWeight: 600,
    px: 3,
    borderWidth: 2,
    '&:hover': {
        borderWidth: 2,
    }
};

/**
 * Estilos base para DialogTitle con gradiente
 * Incluye padding y gradiente de fondo con opacidad
 */
export const dialogTitleGradientStyles = {
    pb: 1.5,
    pt: 3,
    background: `linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)`,
};

/**
 * Estilos comunes para DialogActions
 * Padding y espaciado consistente
 */
export const dialogActionsStyles = {
    px: 3,
    py: 2.5,
    gap: 1.5
};

