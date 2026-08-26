import { Router } from "express";
import * as mercadoPagoController from "../controllers/mercadoPago.controller.js";
import { rateLimit } from "express-rate-limit";

const router = Router();
const limiteVerificacao = rateLimit({ windowMs: 60_000, max: 20 });

router.post("/webhook", mercadoPagoController.WebhookController);
router.get("/verificar-pagamento", mercadoPagoController.VerificarPagamentoController, limiteVerificacao);


export default router;