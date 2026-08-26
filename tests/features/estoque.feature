# language: pt
Funcionalidade: Controle de estoque de números

  Cenário: Ainda há números disponíveis
    Dado que existem 480 números já ocupados no banco
    Quando eu chamo "GET /api/rifa/criar-pagamento"
    Então a resposta HTTP deve ser 200
    E a resposta deve conter um campo "initPoint"

  Cenário: Não há mais números disponíveis
    Dado que existem 500 números já ocupados no banco
    Quando eu chamo "GET /api/rifa/criar-pagamento"
    Então a resposta HTTP deve ser 409
    E nenhuma preferência deve ser criada na API do Mercado Pago
