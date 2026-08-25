import * as RifaTypes from "../types/rifa.types.js";
import type { IRifa } from "../models/Rifa.js";
import { buscarPagamento } from "../mercadoPago/buscarPagamento.js";
import { registrarPagamentoRifa } from "./pagamento.service.js";
import { ConflictError } from "../utils/errors.js";


function mapearStatusMP(statusMP: string): RifaTypes.StatusRifaType {
    const mapa: Record<string, RifaTypes.StatusRifaType> = {
        approved: "confirmado",
        pending: "pendente",
        in_process: "pendente",
        rejected: "cancelado",
        cancelled: "cancelado",
        refunded: "cancelado",
        charged_back: "cancelado",
    };
    return mapa[statusMP] ?? "pendente";
}

export const processarNotificacaoPagamento = async (body: any): Promise<void> => {
    const { type, data } = body ?? {};
    if (type !== "payment" || !data?.id) return;

    try {
        // Nunca confiar no corpo do webhook para status/valor — buscar o
        // dado real na API do Mercado Pago.
        const pagamento = await buscarPagamento(data.id);

        const dadosCriacao: Partial<Omit<IRifa, "paymentId">> = {
            status: mapearStatusMP(pagamento.status!),
            amount: RifaTypes.TICKET_PRICE_BRL,
            ...(pagamento.payer?.email ? { email: pagamento.payer.email } : {}),
        };

        await registrarPagamentoRifa(String(pagamento.id), dadosCriacao);
    } catch (err) {
        if (err instanceof ConflictError) {
            // Reenvio do MP para um paymentId já registrado — comportamento
            // esperado, não é falha.
            console.info("[webhook mercadopago] pagamento já registrado:", data.id);
            return;
        }

        console.error("[webhook mercadopago] falha ao processar", data.id, err);
    }
};