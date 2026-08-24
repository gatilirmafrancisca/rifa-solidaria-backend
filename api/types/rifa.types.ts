// Ajuste estes valores para os reais do seu domínio — são um ponto de
// partida inferido da conversa, não os enums definitivos do projeto.
//
export const TOTAL_NUMEROS = 500;

export const STATUSRIFATYPE = ["pendente", "confirmado", "cancelado"] as const;
export type StatusRifaType = typeof STATUSRIFATYPE[number];