// src/mercadoPago/verificarAssinatura.ts
import { createHmac, timingSafeEqual } from "node:crypto";

interface VerificarAssinaturaArgs {
  xSignature: string | undefined;
  xRequestId: string | undefined | null;
  dataId: string | undefined;
  secret: string;
}

export function verificarAssinaturaMP({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: VerificarAssinaturaArgs): boolean {
  if (!xSignature || !dataId) return false;

  const partes = Object.fromEntries(
    xSignature.split(",").map((par) => {
      const [chave, valor] = par.trim().split("=");
      return [chave, valor];
    })
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};${
    xRequestId ? `request-id:${xRequestId};` : ""
  }ts:${ts};`;

  const assinaturaCalculada = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  // Comparação em tempo constante — evita timing attack na validação.
  const a = Buffer.from(assinaturaCalculada);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}