import { Router } from "express";
import * as preferenciaController from "../controllers/preferencia.controller.js";

const router = Router();

router.get("/", preferenciaController.getPreferencia);

export default router