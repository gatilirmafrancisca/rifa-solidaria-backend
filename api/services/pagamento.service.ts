import Rifa, { type IRifa } from "../models/Rifa.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import {
    normalizarDadosCriacaoRifa,
    validarCriacaoRifa,
    normalizarDadosConfirmacaoRifa,
    validarConfirmacaoRifa,
} from "../utils/rifavalidar.js";
import type ResponseType from "../types/response.type.js";


/**
 * ETAPA 1 — chamada pelo webhook do Mercado Pago.
 * Cria o registro só com o que o MP garante (status, amount, e-mail se
 * disponível). name/phone/claimedNumber nascem null.
 */
export const registrarPagamentoRifa = async (
    paymentId: string,
    dadosBase: Partial<Omit<IRifa, "paymentId">>
): Promise<ResponseType> => {
    try {
        const dadosNormalizados = normalizarDadosCriacaoRifa({ ...dadosBase, paymentId });
        await validarCriacaoRifa(dadosNormalizados);

        const dadosRifa = new Rifa(dadosNormalizados);
        await dadosRifa.save();

        console.log("Novo Cadastro Registrado: ", dadosRifa._id);

        return { status: 201, message: "Pagamento registrado.", data: { id: dadosRifa._id } };
    } catch (error: any) {
        if (error?.code === 11000) {
            // Reenvio do webhook para um paymentId já registrado — não é
            // uma falha real, é o comportamento esperado do Mercado Pago.
            throw new ConflictError("Este pagamento já foi registrado.");
        }

        console.error("registrarPagamentoRifa error:", error);
        throw error;
    }
};


export const confirmarNumeroRifa = async (
    paymentId: string,
    data: Record<string, any>
): Promise<ResponseType> => {
    try {
        const dadosNormalizados = normalizarDadosConfirmacaoRifa(data);
        await validarConfirmacaoRifa(dadosNormalizados);

        // findOneAndUpdate com claimedNumber: null no filtro é o que
        // garante a atomicidade — se dois participantes tentarem
        // confirmar ao mesmo tempo, só o primeiro update encontra o
        // documento; o segundo cai no "rifaNaoEncontrada" abaixo.
        const rifaAtualizada = await Rifa.findOneAndUpdate(
            { paymentId, claimedNumber: null },
            {
                name: dadosNormalizados.name,
                phone: dadosNormalizados.phone,
                email: dadosNormalizados.email,
                claimedNumber: dadosNormalizados.claimedNumber,
            },
            { new: true, runValidators: true }
        );

        if (!rifaAtualizada) {
            const pagamentoExiste = await Rifa.exists({ paymentId });
            throw pagamentoExiste
                ? new ConflictError("Este pagamento já confirmou um número.")
                : new NotFoundError("Pagamento não encontrado ou ainda não processado.");
        }

        return {
            status: 200,
            message: "Número confirmado.",
            data: { id: rifaAtualizada._id, claimedNumber: rifaAtualizada.claimedNumber },
        };
    } catch (error: any) {
        if (error?.code === 11000) {
            // claimedNumber é unique+sparse no schema — isso pega o caso
            // de dois paymentIds diferentes tentando o mesmo número ao
            // mesmo tempo (corrida que o filtro acima sozinho não cobre).
            throw new ConflictError("Este número já foi escolhido por outro participante.");
        }

        console.error("confirmarNumeroRifa error:", error);
        throw error;
    }
};