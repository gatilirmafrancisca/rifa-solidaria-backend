// src/mercadoPago/buscarPagamento.ts
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function buscarPagamento(paymentId: string) {
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
  // .status, .transaction_amount, .payer.email, .external_reference etc.
}