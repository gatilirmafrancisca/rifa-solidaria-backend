import { Router } from "express";
import * as preferenciaController from "../controllers/preferencia.controller.js";
import { requirePaymentToken } from "../middlewares/token.middleware.js";

const router = Router();

router.get("/criar-pagamento", preferenciaController.getPreferencia);
router.post("/confirmar-numero", requirePaymentToken, preferenciaController.confirmarNumero);

export default router;