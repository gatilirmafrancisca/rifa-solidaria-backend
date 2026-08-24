import { type IRifa } from "../models/Rifa.js";
import * as RifaTypes from "../types/rifa.types.js";
import { MissingParamsError, InvalidEnumError } from "./errors.js";

const hasOwnField = (obj: Record<string, any>, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key);
const isEmptyValue = (value: unknown): boolean => value === undefined || value === null || value === "";

const validateStringField = (value: unknown, fieldLabel: string): string => {
    const normalized = String(value ?? "").trim();
    if (!normalized) {
        throw new MissingParamsError(`O campo '${fieldLabel}' não pode estar vazio.`);
    }
    return normalized;
};

// E-mail é sempre obrigatório em IRifa — sem ele não é possível enviar
// a confirmação do número escolhido.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmailField = (value: unknown, fieldLabel: string): string => {
    const normalized = validateStringField(value, fieldLabel);
    if (!EMAIL_REGEX.test(normalized)) {
        throw new MissingParamsError(`O campo '${fieldLabel}' deve ser um e-mail válido.`);
    }
    return normalized.toLowerCase();
};

// "phone" validado por quantidade de dígitos (com ou sem máscara/DDI).
const validatePhoneField = (value: unknown, fieldLabel: string): string => {
    const normalized = validateStringField(value, fieldLabel);
    const digits = normalized.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
        throw new MissingParamsError(`O campo '${fieldLabel}' deve ser um telefone válido, com DDD.`);
    }
    return normalized;
};

const validateNumberField = (value: unknown, fieldLabel: string): number => {
    if (typeof value === "boolean" || isEmptyValue(value)) {
        throw new MissingParamsError(`O campo '${fieldLabel}' deve ser um número válido.`);
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
        throw new MissingParamsError(`O campo '${fieldLabel}' deve ser um número válido e maior ou igual a zero.`);
    }
    return parsed;
};

// "claimedNumber" é nullable por natureza: o registro nasce com
// claimedNumber = null (pagamento aprovado, número ainda não escolhido)
// e só recebe um valor quando o participante confirma o número. Por
// isso esta função aceita null explicitamente e só valida o intervalo
// quando um valor de fato é informado.
const validateClaimedNumberField = (value: unknown, fieldLabel: string): number | null => {
    if (value === null || value === undefined) return null;

    const parsed = validateNumberField(value, fieldLabel);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > RifaTypes.TOTAL_NUMEROS) {
        throw new MissingParamsError(
            `O campo '${fieldLabel}' deve ser um número inteiro entre 1 e ${RifaTypes.TOTAL_NUMEROS}, ou null.`
        );
    }
    return parsed;
};

const validateEnumField = <T extends readonly string[]>(
    value: unknown,
    fieldLabel: string,
    allowedValues: T,
): T[number] => {
    const normalized = validateStringField(value, fieldLabel);
    if (!allowedValues.includes(normalized)) {
        throw new InvalidEnumError(`${fieldLabel} inválido '${normalized}'. Valores permitidos: ${allowedValues.join(", ")}.`);
    }
    return normalized as T[number];
};

const parseNumberFormValue = (value: any): number | undefined => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return undefined;

    const normalized = value.trim();
    if (normalized === "") return undefined;

    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
};

export const normalizarDadosRifa = (data: Partial<IRifa> & Record<string, any>): Partial<IRifa> => {
    const rawData = data as Record<string, any>;
    const normalizedData: Partial<IRifa> & Record<string, any> = { ...data };

    if (hasOwnField(rawData, "amount")) {
        const amountConvertido = parseNumberFormValue(rawData.amount);
        normalizedData.amount = amountConvertido !== undefined || isEmptyValue(rawData.amount)
            ? amountConvertido
            : rawData.amount;
    }

    // claimedNumber tem três estados possíveis vindos do form/JSON:
    // ausente (não mexe), null explícito (mantém null) ou um valor a converter.
    if (hasOwnField(rawData, "claimedNumber") && rawData.claimedNumber !== null) {
        const claimedNumberConvertido = parseNumberFormValue(rawData.claimedNumber);
        normalizedData.claimedNumber = claimedNumberConvertido !== undefined || isEmptyValue(rawData.claimedNumber)
            ? claimedNumberConvertido ?? null
            : rawData.claimedNumber;
    }

    if (hasOwnField(rawData, "email") && !isEmptyValue(rawData.email)) {
        normalizedData.email = String(rawData.email).trim().toLowerCase();
    }

    if (hasOwnField(rawData, "name") && !isEmptyValue(rawData.name)) {
        normalizedData.name = String(rawData.name).trim();
    }

    return normalizedData;
};

export const montarFiltrosRifa = (query: any): Record<string, any> => {
    const filters: Record<string, any> = {};

    if (!query) return filters;

    if (query.status && RifaTypes.STATUSRIFATYPE.includes(query.status as RifaTypes.StatusRifaType)) {
        filters.status = query.status;
    }

    if (hasOwnField(query, "claimedNumber")) {
        if (query.claimedNumber === "null") {
            filters.claimedNumber = null;
        } else {
            const claimedNumber = Number(query.claimedNumber);
            if (!Number.isNaN(claimedNumber)) filters.claimedNumber = claimedNumber;
        }
    }

    if (query.name) {
        filters.name = { $regex: String(query.name).trim(), $options: "i" };
    }

    if (query.email) {
        filters.email = String(query.email).trim().toLowerCase();
    }

    if (query.paymentId) {
        filters.paymentId = String(query.paymentId).trim();
    }

    return filters;
};

export const validarParametros = async (data: IRifa): Promise<any> => {
    const camposAusentes: string[] = [];

    // Validação de presença obrigatória.
    // claimedNumber fica de fora de propósito: é legítimo criar o
    // registro com claimedNumber = null (pagamento aprovado, número
    // ainda não escolhido).
    if (!String(data.paymentId || "").trim()) camposAusentes.push("Payment ID");
    if (!String(data.name || "").trim()) camposAusentes.push("Nome");
    if (!String(data.status || "").trim()) camposAusentes.push("Status");
    if (isEmptyValue(data.amount)) camposAusentes.push("Amount");
    if (!String(data.phone || "").trim()) camposAusentes.push("Telefone");
    if (!String(data.email || "").trim()) camposAusentes.push("E-mail");

    if (camposAusentes.length > 0) {
        throw new MissingParamsError(
            `Os seguintes campos obrigatórios estão ausentes ou vazios: ${camposAusentes.join(", ")}.`
        );
    }

    // Validação de Tipos, formatos e Enums
    validateStringField(data.paymentId, "Payment ID");
    validateStringField(data.name, "Nome");
    validateEnumField(data.status, "Status", RifaTypes.STATUSRIFATYPE);
    validateNumberField(data.amount, "Amount");
    validatePhoneField(data.phone, "Telefone");
    validateEmailField(data.email, "E-mail");

    // claimedNumber: valida o intervalo só se um valor foi de fato informado.
    validateClaimedNumberField(data.claimedNumber, "Número escolhido");
};

const ALLOWED_PATCH_FIELDS = new Set([
    "status",
    "claimedNumber",
    "name",
    "phone",
]);
// paymentId e email propositalmente fora do PATCH — depois de criado,
// não devem trocar de dono por essa via.

export const validatePatchParams = async (data: Partial<IRifa>): Promise<Partial<IRifa>> => {
    const payload = data as Record<string, any>;
    const keys = Object.keys(payload);

    if (keys.length === 0) {
        throw new MissingParamsError("Nenhum dado foi fornecido para atualização.");
    }

    for (const key of keys) {
        if (!ALLOWED_PATCH_FIELDS.has(key)) {
            throw new MissingParamsError(`O campo '${key}' não é permitido na atualização.`);
        }
    }

    if (hasOwnField(payload, "status")) {
        payload.status = validateEnumField(payload.status, "Status", RifaTypes.STATUSRIFATYPE);
    }

    // Só valida o formato aqui. A regra de "não pode sobrescrever um
    // claimedNumber já definido" é uma corrida de concorrência real
    // (dois participantes podem tentar o mesmo número ao mesmo tempo) —
    // isso pertence ao update atômico no service (findOneAndUpdate com
    // filtro claimedNumber: null), não a uma validação de formato aqui.
    if (hasOwnField(payload, "claimedNumber")) {
        payload.claimedNumber = validateClaimedNumberField(payload.claimedNumber, "Número escolhido");
    }

    if (hasOwnField(payload, "name")) {
        payload.name = validateStringField(payload.name, "name");
    }

    if (hasOwnField(payload, "phone")) {
        payload.phone = validatePhoneField(payload.phone, "phone");
    }

    return payload as Partial<IRifa>;
};