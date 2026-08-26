import { MercadoPagoConfig, Preference } from "mercadopago";

function getClient() {
    return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

export const mercadoPagoPreferenceClient = {
    async criar() {
        const preference = new Preference(getClient());
        const FRONTEND_URL = process.env.FRONTEND_URL ?? "";
        const usaAutoReturn = FRONTEND_URL.startsWith("https://");

        return preference.create({
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
                ...(usaAutoReturn ? { auto_return: "approved" as const } : {}),
                statement_descriptor: "GATIL IRMA FRANCISCA",
            },
        });
    },
};

export async function criarPreferenciaRifa() {
    return mercadoPagoPreferenceClient.criar();
}