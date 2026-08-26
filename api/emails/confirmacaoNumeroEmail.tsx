import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Heading,
    Text,
    Hr,
} from "@react-email/components";

interface ConfirmacaoNumeroEmailProps {
    name: string;
    claimedNumber: number;
}

const cores = {
    verde: "#368c5e",
    verdeEscuro: "#1a5331",
    laranja: "#ff9d3b",
    creme: "#fffccc",
    neutro: "#f7f7f7",
    carvao: "#1e1b1c",
};

export function ConfirmacaoNumeroEmail({
    name,
    claimedNumber,
}: ConfirmacaoNumeroEmailProps) {
    const numeroFormatado = String(claimedNumber).padStart(3, "0");

    return (
        <Html>
            <Head />
            <Preview>
                Seu número na Rifa Solidária do Gatil: {numeroFormatado}
            </Preview>
            <Body style={{ backgroundColor: cores.neutro, fontFamily: "sans-serif" }}>
                <Container
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        padding: "32px",
                        margin: "24px auto",
                        maxWidth: "440px",
                    }}
                >
                    <Section style={{ textAlign: "center", marginBottom: "16px" }}>
                        <Text
                            style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: cores.verdeEscuro,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                            }}
                        >
                            Gatil Irmã Francisca · Ação Solidária
                        </Text>
                    </Section>

                    <Heading
                        style={{
                            color: cores.verdeEscuro,
                            fontSize: "24px",
                            textAlign: "center",
                            margin: "0 0 8px",
                        }}
                    >
                        Prontinho, {name}! 🐾
                    </Heading>

                    <Text
                        style={{
                            textAlign: "center",
                            color: cores.carvao,
                            fontSize: "14px",
                            lineHeight: "22px",
                        }}
                    >
                        Sua participação na Rifa Solidária está confirmada.
                    </Text>

                    <Section style={{ textAlign: "center", margin: "24px 0" }}>
                        <Text
                            style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#8a8a84",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                margin: "0 0 4px",
                            }}
                        >
                            Seu número
                        </Text>
                        <Text
                            style={{
                                fontSize: "44px",
                                fontWeight: 700,
                                color: cores.laranja,
                                margin: 0,
                            }}
                        >
                            {numeroFormatado}
                        </Text>
                    </Section>

                    <Hr style={{ borderColor: "#e3e3dd", margin: "20px 0" }} />

                    <Text
                        style={{
                            fontSize: "13px",
                            lineHeight: "20px",
                            color: cores.carvao,
                            textAlign: "center",
                        }}
                    >
                        O sorteio é <strong>ao vivo, no Instagram do Gatil</strong>, no dia{" "}
                        <strong>07/09</strong>. Boa sorte!
                    </Text>

                    <Text
                        style={{
                            fontSize: "11px",
                            color: "#9a9a92",
                            textAlign: "center",
                            marginTop: "24px",
                        }}
                    >
                        Gatil Irmã Francisca — CNPJ 25.382.038/0001-05
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

export default ConfirmacaoNumeroEmail;