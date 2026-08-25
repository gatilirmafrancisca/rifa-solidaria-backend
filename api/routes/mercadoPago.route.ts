import { Router } from "express";
import * as mercadoPagoController from "../controllers/mercadoPago.controller.js";

const router = Router();

router.post("/", mercadoPagoController.WebhookController);


export default router;