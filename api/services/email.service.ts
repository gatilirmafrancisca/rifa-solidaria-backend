import { Resend } from "resend";
import { ConfirmacaoNumeroEmail } from "../emails/confirmacaoNumeroEmail.js";

// Igual fizemos com o MercadoPagoConfig: construir dentro da função,
// não no topo do arquivo — senão qualquer import desse módulo (mesmo
// em testes que nunca chegam a enviar e-mail) já quebra se
// RESEND_API_KEY não estiver definida no ambiente.
function getResendClient() {
    return new Resend(process.env.RESEND_API_KEY);
}

interface EnviarEmailConfirmacaoArgs {
    name: string;
    email: string;
    claimedNumber: number;
}

/**
 * Dispara o e-mail de confirmação. Nunca lança erro pra quem chamou —
 * uma falha de envio não pode derrubar uma confirmação de número que
 * já foi salva com sucesso no banco. Falhas ficam só logadas, pra
 * reenvio manual (ver reenviarEmail.controller.ts).
 */
export async function enviarEmailConfirmacao({
    name,
    email,
    claimedNumber,
}: EnviarEmailConfirmacaoArgs): Promise<boolean> {
    try {
        const resend = getResendClient();

        const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: `Seu número na Rifa Solidária: ${String(claimedNumber).padStart(3, "0")}`,
            react: ConfirmacaoNumeroEmail({ name, claimedNumber }),
        });

        if (error) {
            console.error("[email] Resend devolveu erro:", email, error);
            return false;
        }

        return true;
    } catch (err) {
        // Cobre tanto falha de rede quanto o construtor do Resend
        // reclamando de API key ausente (comum em ambiente de teste,
        // onde RESEND_API_KEY não é definida de propósito).
        console.error("[email] falha ao enviar confirmação", email, err);
        return false;
    }
}