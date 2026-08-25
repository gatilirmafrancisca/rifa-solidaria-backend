// src/mercadoPago/buscarPagamento.ts
import { MercadoPagoConfig, Payment } from "mercadopago";

function getClient() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

export async function buscarPagamento(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
  // .status, .transaction_amount, .payer.email, .external_reference etc.
}