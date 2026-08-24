import Rifa, { type IRifa } from "../models/Rifa.js";
import { ConflictError } from "../utils/errors.js";
import { normalizarDadosRifa, validarParametros } from "../utils/rifavalidar.js";
import type ResponseType from "../types/response.type.js";

export const registrarRifa = async (data: IRifa): Promise<ResponseType> => {

     try {
 
        const dadosNormalizados = normalizarDadosRifa(data);
        await validarParametros(dadosNormalizados as IRifa);
 
        const dadosRifa = new Rifa(dadosNormalizados);
        await dadosRifa.save();
 
        return { status: 201, message: "Número confirmado.", data: { id: dadosRifa._id, numero: dadosRifa.claimedNumber } };
 
    } catch (error: any) {
 
        // Índice único em "numero" (e em "paymentId") no schema do Mongoose
        // é o que garante isso na prática — aqui só traduzimos o erro
        // 11000 do Mongo numa mensagem que faz sentido pra quem chamou.
        if (error?.code === 11000) {
            const campoDuplicado = Object.keys(error.keyPattern ?? {})[0];
            throw new ConflictError(
                campoDuplicado === "paymentId"
                    ? "Este pagamento já foi usado para confirmar um número."
                    : "Este número já foi escolhido por outro participante."
            );
        }
 
        console.error("criarRifaService error:", error);
        throw error;
    }


}