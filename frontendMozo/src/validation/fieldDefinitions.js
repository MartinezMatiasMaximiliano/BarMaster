const DEFAULT_MESSAGES = {
    required: "Este campo es obligatorio.",
    letters: "Formato invalido. Solo se permiten letras, espacios y signos de puntuacion.",
    integer: "Formato invalido. Solo se permiten numeros.",
    decimal: "Formato invalido. Solo se permiten numeros y una coma decimal.",
    image: "Solo se permite subir imagenes.",
    code4: "Formato invalido. Se permiten unicamente 4 numeros.",
    text: "Formato invalido. Se permiten letras y numeros",
    datetime: "Formato invalido. La fecha ingresada no es valida.",
    select: "Debe seleccionar una opcion valida.",
    select_multiple: "Debe seleccionar al menos una opcion.",
    min: "El valor ingresado es menor al permitido.",
    max: "El valor ingresado es mayor al permitido.",
    unknown: "Formato invalido.",
};

export function resolveFieldValidationConfig(fieldOrName) {
    const field = typeof fieldOrName === "string"
        ? { name: fieldOrName }
        : (fieldOrName ?? {});

    const validationConfig = field.validation ?? {};

    return {
        ...field,
        required: validationConfig.required ?? field.required ?? false,
        validator: validationConfig.rule ?? field.validator ?? null,
        min: validationConfig.min ?? field.min,
        max: validationConfig.max ?? field.max,
        maxDecimals: validationConfig.maxDecimals ?? field.maxDecimals,
        messages: {
            ...DEFAULT_MESSAGES,
            ...(field.messages ?? {}),
            ...(validationConfig.messages ?? {}),
        },
    };
}
