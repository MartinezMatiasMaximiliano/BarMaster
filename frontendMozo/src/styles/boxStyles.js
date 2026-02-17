/**
 * Estilos compartidos para Box, Paper y contenedores
 * Reutilizables en todo el sistema (objetos para sx de MUI)
 */

/**
 * Contenedor con borde tipo card/panel
 */
export const boxCardBorder = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1
};

/**
 * Línea divisoria (solo borde inferior)
 */
export const boxDividerLine = {
    borderBottom: 1,
    borderColor: 'divider'
};

/**
 * Variante con padding horizontal y borde inferior (headers de sección)
 */
export const boxDividerLineWithPadding = {
    ...boxDividerLine,
    p: 2
};

/**
 * Variante con margen inferior
 */
export const boxDividerLineWithMargin = {
    ...boxDividerLine,
    mb: 3
};

/**
 * Formularios centrados (login, cambiar clave)
 */
export const formCentered = {
    maxWidth: 400,
    mx: 'auto',
    mt: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
};

/**
 * Tarjetas de balance en Caja (EstadoActual)
 */
export const boxBalanceCard = {
    flex: '1 1 50%',
    minWidth: 0,
    p: 3,
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
    textAlign: 'center',
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxSizing: 'border-box'
};

/**
 * Lista con scroll y borde
 */
export const scrollableListContainer = {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 1
};

/**
 * Mensaje "no hay datos" centrado
 */
export const boxEmptyMessage = {
    p: 3,
    textAlign: 'center'
};

/**
 * Mensaje vacío centrado con flex (para contenedores flex)
 */
export const boxEmptyMessageFlex = {
    ...boxEmptyMessage,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};
