export const validationPatterns = {
    letters: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,:;!?]*$/,
    integer: /^[0-9]+$/,
    phone: /^[0-9]{10}$/,
    money: /^(?:0|[1-9]\d{0,9})(?:[,.]\d{1,2})?$/,
    decimal: /^[0-9]+(?:[,.][0-9]+)?$/,
    imageMime: /image/i,
    code4: /^[0-9]{4}$/,
    text: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s°$.!¿?*[\],#-]*$/,
};
