import { When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../api/app.js";

When("eu chamo {string}", async function (this: any, comando: string) {
    const [metodo, caminho] = comando.split(" ") as [string, string];
    const metodoLower = metodo.toLowerCase() as "get" | "post";
    this.lastResponse = await (request(app) as any)[metodoLower](caminho);
});

Then("a resposta HTTP deve ser {int}", function (this: any, status: number) {
    assert.equal(this.lastResponse.status, status);
});

Then("a resposta deve conter um campo {string}", function (this: any, campo: string) {
    assert.ok(
        this.lastResponse.body[campo] !== undefined,
        `campo '${campo}' ausente na resposta: ${JSON.stringify(this.lastResponse.body)}`
    );
});

Then("a resposta não deve conter um campo {string}", function (this: any, campo: string) {
    assert.equal(this.lastResponse.body[campo], undefined);
});