import { getFieldError } from "./formValidation";

export function createMoneyField(name, options = {}) {
    return {
        name,
        validation: {
            required: options.required ?? true,
            rule: "money",
            ...(options.validation ?? {}),
        },
        ...(options.messages ? { messages: options.messages } : {}),
    };
}

export function getMoneyFieldError(name, value, options = {}) {
    return getFieldError(name, value, createMoneyField(name, options));
}

export function getPositiveMoneyFieldError(name, value, options = {}) {
    const formatError = getMoneyFieldError(name, value, options);
    if (formatError) {
        return formatError;
    }

    const normalizedValue = String(value).trim().replace(",", ".");
    const numericValue = Number(normalizedValue);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return options.positiveMessage ?? "El monto debe ser mayor a 0.";
    }

    return null;
}
