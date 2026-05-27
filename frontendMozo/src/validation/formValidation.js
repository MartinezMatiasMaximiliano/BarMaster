import { z } from "zod";
import { resolveFieldValidationConfig } from "./fieldDefinitions.js";
import { validationPatterns } from "./patterns.js";

function isEmptyValue(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

function addIssue(ctx, message, errorCode) {
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        params: { errorCode },
    });
}

function asTrimmedString(value) {
    return typeof value === "string" ? value.trim() : String(value);
}

function parseNumericValue(value) {
    if (typeof value === "number") {
        return value;
    }

    const normalizedValue = asTrimmedString(value).replace(",", ".");
    return Number(normalizedValue);
}

function validateNumericRange(value, fieldConfig, ctx) {
    const numericValue = parseNumericValue(value);
    if (Number.isNaN(numericValue)) {
        return;
    }

    if (typeof fieldConfig.min === "number" && numericValue < fieldConfig.min) {
        addIssue(ctx, fieldConfig.messages.min, "min");
    }

    if (typeof fieldConfig.max === "number" && numericValue > fieldConfig.max) {
        addIssue(ctx, fieldConfig.messages.max, "max");
    }
}

function validateStringLength(value, fieldConfig, ctx) {
    const stringValue = asTrimmedString(value);

    if (typeof fieldConfig.exactLength === "number" && stringValue.length !== fieldConfig.exactLength) {
        addIssue(ctx, fieldConfig.messages.exactLength, "exactLength");
        return;
    }

    if (typeof fieldConfig.minLength === "number" && stringValue.length < fieldConfig.minLength) {
        addIssue(ctx, fieldConfig.messages.minLength, "minLength");
    }

    if (typeof fieldConfig.maxLength === "number" && stringValue.length > fieldConfig.maxLength) {
        addIssue(ctx, fieldConfig.messages.maxLength, "maxLength");
    }
}

function isValidDateValue(value) {
    if (value instanceof Date) {
        return !Number.isNaN(value.getTime());
    }

    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);
    return !Number.isNaN(date.getTime());
}

function matchesOptionValue(option, value) {
    const optionValue = typeof option === "object" && option !== null
        ? (option.id ?? option.value ?? option.nombre)
        : option;

    return String(optionValue) === String(value);
}

function validateLetters(value, fieldConfig, ctx) {
    if (!validationPatterns.letters.test(asTrimmedString(value))) {
        addIssue(ctx, fieldConfig.messages.letters, "letters");
    }
}

function validateIntegerLike(value, fieldConfig, ctx, { patternKey = "integer", messageKey = "integer" } = {}) {
    if (typeof value === "number") {
        if (!Number.isInteger(value) || value < 0) {
            addIssue(ctx, fieldConfig.messages[messageKey], messageKey);
        }
        validateNumericRange(value, fieldConfig, ctx);
        return;
    }

    const stringValue = asTrimmedString(value);
    if (!validationPatterns[patternKey].test(stringValue)) {
        addIssue(ctx, fieldConfig.messages[messageKey], messageKey);
        return;
    }

    validateStringLength(stringValue, fieldConfig, ctx);
    validateNumericRange(value, fieldConfig, ctx);
}

function validateInteger(value, fieldConfig, ctx) {
    validateIntegerLike(value, fieldConfig, ctx, { patternKey: "integer", messageKey: "integer" });
}

function validatePhone(value, fieldConfig, ctx) {
    validateIntegerLike(value, fieldConfig, ctx, { patternKey: "phone", messageKey: "phone" });
}

function validateEmail(value, fieldConfig, ctx) {
    if (!validationPatterns.email.test(asTrimmedString(value))) {
        addIssue(ctx, fieldConfig.messages.email, "email");
    }
}

function validateDecimalLike(value, fieldConfig, ctx, { patternKey = "decimal", messageKey = "decimal" } = {}) {
    if (typeof value === "number") {
        if (!Number.isFinite(value) || value < 0) {
            addIssue(ctx, fieldConfig.messages[messageKey], messageKey);
        }
        validateNumericRange(value, fieldConfig, ctx);
        return;
    }

    const stringValue = asTrimmedString(value);
    if (!validationPatterns[patternKey].test(stringValue)) {
        addIssue(ctx, fieldConfig.messages[messageKey], messageKey);
        return;
    }

    validateStringLength(stringValue.replace(/[,.]/g, ""), fieldConfig, ctx);

    if (
        typeof fieldConfig.maxDecimals === "number" &&
        (stringValue.includes(",") || stringValue.includes("."))
    ) {
        const separator = stringValue.includes(",") ? "," : ".";
        const [, decimalPart = ""] = stringValue.split(separator);
        if (decimalPart.length > fieldConfig.maxDecimals) {
            addIssue(ctx, fieldConfig.messages[messageKey], messageKey);
        }
    }

    validateNumericRange(value, fieldConfig, ctx);
}

function validateDecimal(value, fieldConfig, ctx) {
    validateDecimalLike(value, fieldConfig, ctx, { patternKey: "decimal", messageKey: "decimal" });
}

function validateMoney(value, fieldConfig, ctx) {
    validateDecimalLike(value, fieldConfig, ctx, { patternKey: "money", messageKey: "money" });
}

function validateImage(value, fieldConfig, ctx) {
    if (typeof value === "string") {
        if (value.trim().length > 0) {
            return;
        }
        addIssue(ctx, fieldConfig.messages.image, "image");
        return;
    }

    const mimeType = value?.type ?? "";
    if (!validationPatterns.imageMime.test(mimeType)) {
        addIssue(ctx, fieldConfig.messages.image, "image");
    }
}

function validateCode4(value, fieldConfig, ctx) {
    if (!validationPatterns.code4.test(asTrimmedString(value))) {
        addIssue(ctx, fieldConfig.messages.code4, "code4");
    }
}

function validateText(value, fieldConfig, ctx) {
    const stringValue = asTrimmedString(value);

    if (!validationPatterns.text.test(stringValue)) {
        addIssue(ctx, fieldConfig.messages.text, "text");
        return;
    }

    validateStringLength(stringValue, fieldConfig, ctx);
}

function validateDateTime(value, fieldConfig, ctx) {
    if (!isValidDateValue(value)) {
        addIssue(ctx, fieldConfig.messages.datetime, "datetime");
    }
}

function validateSelectMultiple(value, fieldConfig, ctx) {
    if (!Array.isArray(value)) {
        addIssue(ctx, fieldConfig.messages.select_multiple, "select_multiple");
        return;
    }

    if (Array.isArray(fieldConfig.options) && fieldConfig.options.length > 0) {
        const invalidValue = value.some(
            (selectedValue) => !fieldConfig.options.some((option) => matchesOptionValue(option, selectedValue))
        );

        if (invalidValue) {
            addIssue(ctx, fieldConfig.messages.select_multiple, "select_multiple");
        }
    }
}

function validateSelect(value, fieldConfig, ctx) {
    if (Array.isArray(fieldConfig.options) && fieldConfig.options.length > 0) {
        const optionExists = fieldConfig.options.some((option) => matchesOptionValue(option, value));
        if (!optionExists) {
            addIssue(ctx, fieldConfig.messages.select, "select");
        }
    }
}

const validators = {
    letters: validateLetters,
    integer: validateInteger,
    phone: validatePhone,
    email: validateEmail,
    money: validateMoney,
    decimal: validateDecimal,
    image: validateImage,
    code4: validateCode4,
    text: validateText,
    datetime: validateDateTime,
    select: validateSelect,
    select_multiple: validateSelectMultiple,
};

export function createFieldSchema(fieldOrName) {
    const fieldConfig = resolveFieldValidationConfig(fieldOrName);

    return z.any().superRefine((value, ctx) => {
        if (isEmptyValue(value)) {
            if (fieldConfig.required) {
                addIssue(ctx, fieldConfig.messages.required, "required");
            }
            return;
        }

        const validator = validators[fieldConfig.validator];
        if (!validator) {
            return;
        }

        validator(value, fieldConfig, ctx);
    });
}

export function buildFormSchema(fields = []) {
    const shape = {};

    fields.forEach((field) => {
        if (!field?.name) return;
        shape[field.name] = createFieldSchema(field);
    });

    return z.object(shape);
}

export function isRequiredField(fieldOrName) {
    return resolveFieldValidationConfig(fieldOrName).required;
}

export function getFieldError(key, value, field = null) {
    const schema = createFieldSchema(field ?? key);
    const result = schema.safeParse(value);

    if (result.success) {
        return null;
    }

    return result.error.issues[0]?.message ?? "Formato invalido.";
}

export function validateForm(fields = [], values = {}) {
    const schema = buildFormSchema(fields);
    const valuesToValidate = {};

    fields.forEach((field) => {
        if (!field?.name) return;
        valuesToValidate[field.name] = values[field.name];
    });

    const result = schema.safeParse(valuesToValidate);
    if (result.success) {
        return {};
    }

    return result.error.issues.reduce((errors, issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !errors[fieldName]) {
            errors[fieldName] = issue.message;
        }
        return errors;
    }, {});
}

export function validateFieldAndSetError(key, value, setErrors, field = null) {
    const error = getFieldError(key, value, field);

    setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };

        if (error) {
            newErrors[key] = error;
        } else {
            delete newErrors[key];
        }

        return newErrors;
    });
}
