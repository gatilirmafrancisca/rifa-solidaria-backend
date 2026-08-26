import { Router } from "express";
import * as rifaController from "../controllers/rifa.controller.js";
import { requirePaymentToken } from "../middlewares/token.middleware.js";

const router = Router();

router.get("/criar-pagamento", rifaController.getPreferencia);
router.post("/confirmar-numero", requirePaymentToken, rifaController.confirmarNumero);
router.get("/numeros-ocupados", rifaController.getAllRifas);
router.post("/reenviar-email", requirePaymentToken, rifaController.reenviarEmail);

export default router;