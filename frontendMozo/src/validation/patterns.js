export const validationPatterns = {
    letters: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,:;!?]*$/,
    integer: /^[0-9]+$/,
    decimal: /^[0-9]+(?:[,.][0-9]+)?$/,
    imageMime: /image/i,
    code4: /^[0-9]{4}$/,
    text: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s°$.!¿?*[\],#-]*$/,
};
