import { MercadoPagoConfig, Preference } from "mercadopago";

function getClient() {
    return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

const FRONTEND_URL = process.env.FRONTEND_URL!;
const usaAutoReturn = FRONTEND_URL.startsWith("https://");

export async function criarPreferenciaRifa() {
    const preference = new Preference(getClient());

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

            payment_methods: {
                excluded_payment_methods: [{ id: "bolbradesco" }]
            },

            ...(usaAutoReturn ? { auto_return: "approved" as const } : {}),
            statement_descriptor: "GATIL IRMA FRANCISCA",
        },
    });

    return result;
}