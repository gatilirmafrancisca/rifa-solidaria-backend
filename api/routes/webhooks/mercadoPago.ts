// src/routes/webhooks/mercadoPago.ts
import { Router } from "express";
import { verificarAssinaturaMP } from "../../mercadoPago/verificarAssinatura.js";
import { buscarPagamento } from "../../mercadoPago/buscarPagamento.js";
import { registrarPagamento } from "../../services/pagamentoService.js";

export const mercadoPagoWebhookRouter = Router();

mercadoPagoWebhookRouter.post("/webhooks/mercadopago", async (req, res) => {
  // 1. Validar que a requisição realmente veio do Mercado Pago
  const assinaturaValida = verificarAssinaturaMP({
    xSignature: req.header("x-signature"),
    xRequestId: req.header("x-request-id"),
    dataId: req.body?.data?.id ?? req.query["data.id"],
    secret: process.env.MP_WEBHOOK_SECRET!,
  });

  if (!assinaturaValida) {
    // Descarte silenciosamente. Não dê pista do motivo pra quem enviou.
    return res.status(401).end();
  }

  // 2. Responder rápido — o MP reenvia se não receber 200 a tempo.
  //    Processar de forma síncrona aqui é aceitável na escala da rifa,
  //    mas se o volume crescer, mova o processamento pra uma fila.
  res.status(200).end();

  const { type, data } = req.body;
  if (type !== "payment" || !data?.id) return;

  try {
    // 3. NUNCA confiar no corpo do webhook para o status/valor.
    //    Buscar o dado real na API, com o Access Token.
    const pagamento = await buscarPagamento(data.id);

    // 4. Persistir de forma idempotente (upsert por paymentId).
    await registrarPagamento(pagamento);
  } catch (err) {
    // Logar com detalhe — isso é dinheiro de doação, não é opcional debugar.
    console.error("[webhook mercadopago] falha ao processar", data.id, err);
  }
});