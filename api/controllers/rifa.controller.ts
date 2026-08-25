import {type NextFunction, type Request, type Response} from "express";
import { criarPreferenciaRifa } from "../mercadoPago/criarPreferencia.js";
import { confirmarNumeroRifa } from "../services/rifa.service.js";
import Rifa from "../models/Rifa.js";
import * as RifaTypes from "../types/rifa.types.js";
import type { AuthenticatedRequest } from "../middlewares/token.middleware.js";


export const getPreferencia = async(req: Request, res: Response) => {

    const vagasOcupadas = await Rifa.countDocuments({
        status: { $ne: "cancelado" satisfies RifaTypes.StatusRifaType },
    });
 
    if (vagasOcupadas >= RifaTypes.TOTAL_NUMEROS) {
        return res.status(409).json({ message: "Não há mais números disponíveis nesta rifa." });
    }
 
    const preferencia = await criarPreferenciaRifa();
    res.json({ initPoint: preferencia.init_point });

}

export const confirmarNumero = async(req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    try {

        const resposta = await confirmarNumeroRifa(req.paymentId!, req.body);
        return res.status(resposta.status).json({ message: resposta.message, data: resposta.data });

    } catch (error) {
        next(error);
    }

}