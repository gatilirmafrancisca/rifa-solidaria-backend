import { Before, After, BeforeAll } from "@cucumber/cucumber";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { resetarFakesMercadoPago } from "../support/mercadoPagoFake.js";

BeforeAll(function () {
    // Só define se ainda não existir — em CI, o workflow já define
    // esses valores; localmente, sem .env de teste, isso evita que
    // todo mundo precise lembrar de criar um antes de rodar.
    process.env.JWT_SECRET ??= "segredo-de-teste-local";
    process.env.MP_ACCESS_TOKEN ??= "fake-token-testes";
    process.env.MP_WEBHOOK_SECRET ??= "segredo-webhook-teste";
    process.env.RESEND_API_KEY ??= "re_fake_teste";
    process.env.EMAIL_FROM ??= "Teste <teste@example.com>";
});

let mongod: MongoMemoryServer;

Before(async function () {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    resetarFakesMercadoPago();
});

After(async function () {
    await mongoose.disconnect();
    await mongod.stop();
});