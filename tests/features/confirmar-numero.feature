# language: pt
Funcionalidade: Confirmação de número com token de posse

  Cenário: Confirmação bem-sucedida
    Dado que tenho um token válido para o pagamento "999020"
    E o número 137 está disponível
    Quando eu envio "POST /api/rifa/confirmar-numero" com o token e os dados do participante para o número 137
    Então a resposta HTTP deve ser 200
    E o documento do pagamento "999020" deve ter claimedNumber igual a 137

  Cenário: Requisição sem token é rejeitada
    Quando eu envio "POST /api/rifa/confirmar-numero" sem header de autorização
    Então a resposta HTTP deve ser 401

  Cenário: Token expirado é rejeitado
    Dado que tenho um token expirado para o pagamento "999021"
    Quando eu envio "POST /api/rifa/confirmar-numero" com esse token
    Então a resposta HTTP deve ser 401

  Cenário: Dois pagamentos disputam o mesmo número ao mesmo tempo
    Dado que tenho tokens válidos para os pagamentos "999022" e "999023"
    E o número 250 está disponível
    Quando os dois pagamentos tentam confirmar o número 250 simultaneamente
    Então exatamente uma das duas respostas deve ser 200
    E a outra resposta deve ser 409
    E deve existir exatamente 1 documento no banco com claimedNumber igual a 250

  Cenário: Mesmo pagamento tenta confirmar duas vezes
    Dado que tenho um token válido para o pagamento "999024"
    E esse pagamento já confirmou o número 88
    Quando eu envio "POST /api/rifa/confirmar-numero" de novo com o mesmo token, para o número 300
    Então a resposta HTTP deve ser 409
    E o claimedNumber do pagamento "999024" deve continuar sendo 88

  Cenário: Dados de participante incompletos são rejeitados
    Dado que tenho um token válido para o pagamento "999025"
    Quando eu envio "POST /api/rifa/confirmar-numero" sem o campo "phone"
    Então a resposta HTTP deve ser 400