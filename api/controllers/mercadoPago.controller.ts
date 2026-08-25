import { type Request, type Response } from "express";
import { verificarAssinaturaMP } from "../mercadoPago/verificarAssinatura.js";
import { processarNotificacaoPagamento } from "../services/mercadoPago.service.js";

export const WebhookController = async (req: Request, res: Response) => {
    const assinaturaValida = verificarAssinaturaMP({
        xSignature: req.header("x-signature"),
        xRequestId: req.header("x-request-id"),
        dataId: req.body?.data?.id ?? req.query["data.id"],
        secret: process.env.MP_WEBHOOK_SECRET!,
    });

    if (!assinaturaValida) {
        // Única resposta deste caminho — ok, mesmo que "res.json" apareça
        // de novo em algum outro branch, aqui a função já termina.
        return res.status(401).json({ message: "Assinatura inválida." });
    }

    // Ack imediato — a partir daqui, res já está finalizado. Nenhum
    // código depois deste ponto pode chamar res.* de novo.
    res.status(200).end();

    // Processamento acontece depois do ack, sem bloquear a resposta ao
    // Mercado Pago. Erros são só logados dentro do próprio service —
    // não há mais como (nem por que) responder ao cliente por eles.
    void processarNotificacaoPagamento(req.body);
};