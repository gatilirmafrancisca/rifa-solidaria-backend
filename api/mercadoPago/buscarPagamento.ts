import { MercadoPagoConfig, Payment } from "mercadopago";

function getClient() {
    return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

// Objeto mutável de propósito — é isso que permite os testes
// substituírem a chamada real por uma fake (ver
// tests/support/mercadoPagoFake.ts), sem precisar de um framework de
// mocking de módulos ESM.
export const mercadoPagoClient = {
    async buscarPagamento(paymentId: string) {
        const payment = new Payment(getClient());
        return payment.get({ id: paymentId });
    },
};

export async function buscarPagamento(paymentId: string) {
    return mercadoPagoClient.buscarPagamento(paymentId);
}