// src/mercadoPago/criarPreferencia.ts
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const FRONTEND_URL = process.env.FRONTEND_URL!;

export async function criarPreferenciaRifa() {
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          id: "rifa-solidaria-2026",
          title: "Número da Rifa Solidária — Gatil Irmã Francisca",
          quantity: 1,
          unit_price: 100,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${FRONTEND_URL}/pagamento-aprovado`,
        pending: `${FRONTEND_URL}/pagamento-pendente`,
        failure: `${FRONTEND_URL}/pagamento-recusado`,
      },
      auto_return: "approved",
      statement_descriptor: "GATIL IRMA FRANCISCA",
    },
  });

  return result; // contém .id (preference_id) e .init_point
}