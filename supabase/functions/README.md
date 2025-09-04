# Edge Functions - InstaFly

Este diretório contém todas as Edge Functions necessárias para o funcionamento do InstaFly no Supabase.

## Como Criar e Fazer Deploy das Edge Functions

### 1. Pré-requisitos

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login no Supabase
supabase login

# Inicializar projeto (se ainda não foi feito)
supabase init

# Linkar com seu projeto no Supabase
supabase link --project-ref SEU_PROJECT_REF
```

### 2. Estrutura das Edge Functions

Cada Edge Function deve estar em sua própria pasta dentro de `supabase/functions/`:

```
supabase/
└── functions/
    ├── get-instagram-profile/
    │   └── index.ts
    ├── process-order/
    │   └── index.ts
    ├── create-payment/
    │   └── index.ts
    └── ...
```

### 3. Deploy das Functions

```bash
# Deploy de uma função específica
supabase functions deploy NOME_DA_FUNCAO

# Deploy de todas as funções
supabase functions deploy

# Verificar status das funções
supabase functions list
```

### 4. Variáveis de Ambiente

Configure as seguintes variáveis no painel do Supabase (Settings > Edge Functions):

- `MERCADOPAGO_ACCESS_TOKEN`
- `WHATSAPP_API_TOKEN`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `OPENAI_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `INSTAGRAM_API_TOKEN`

### 5. Testando as Functions

```bash
# Testar localmente
supabase functions serve

# Testar função específica
curl -X POST 'http://localhost:54321/functions/v1/NOME_DA_FUNCAO' \
  -H 'Authorization: Bearer ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": true}'
```

## Lista de Edge Functions

### 1. get-instagram-profile
**Descrição**: Obtém informações do perfil do Instagram
**Endpoint**: `/functions/v1/get-instagram-profile`
**Método**: POST
**Payload**: `{"username": "string"}`

### 2. process-order
**Descrição**: Processa pedidos de serviços
**Endpoint**: `/functions/v1/process-order`
**Método**: POST
**Payload**: `{"service_id": "string", "quantity": number, "target_url": "string"}`

### 3. create-payment
**Descrição**: Cria pagamentos via MercadoPago
**Endpoint**: `/functions/v1/create-payment`
**Método**: POST
**Payload**: `{"amount": number, "description": "string", "user_id": "string"}`

### 4. webhook-mercadopago
**Descrição**: Webhook para receber notificações do MercadoPago
**Endpoint**: `/functions/v1/webhook-mercadopago`
**Método**: POST
**Payload**: Webhook do MercadoPago

### 5. sync-order-status
**Descrição**: Sincroniza status dos pedidos
**Endpoint**: `/functions/v1/sync-order-status`
**Método**: POST
**Payload**: `{"order_id": "string"}`

### 6. send-whatsapp
**Descrição**: Envia mensagens via WhatsApp
**Endpoint**: `/functions/v1/send-whatsapp`
**Método**: POST
**Payload**: `{"phone": "string", "message": "string"}`

### 7. send-push-notification
**Descrição**: Envia notificações push
**Endpoint**: `/functions/v1/send-push-notification`
**Método**: POST
**Payload**: `{"user_id": "string", "title": "string", "body": "string"}`

### 8. auto-sync-orders
**Descrição**: Sincronização automática de pedidos
**Endpoint**: `/functions/v1/auto-sync-orders`
**Método**: POST
**Payload**: `{}`

### 9. test-evolution-connection
**Descrição**: Testa conexão com Evolution API
**Endpoint**: `/functions/v1/test-evolution-connection`
**Método**: POST
**Payload**: `{}`

### 10. process-whatsapp-notifications
**Descrição**: Processa notificações do WhatsApp
**Endpoint**: `/functions/v1/process-whatsapp-notifications`
**Método**: POST
**Payload**: Webhook do WhatsApp

### 11. invoke-llm
**Descrição**: Invoca modelos de linguagem (OpenAI/ChatGPT)
**Endpoint**: `/functions/v1/invoke-llm`
**Método**: POST
**Payload**: `{"prompt": "string", "model": "string"}`

### 12. send-email
**Descrição**: Envia emails
**Endpoint**: `/functions/v1/send-email`
**Método**: POST
**Payload**: `{"to": "string", "subject": "string", "body": "string"}`

### 13. generate-image
**Descrição**: Gera imagens usando IA
**Endpoint**: `/functions/v1/generate-image`
**Método**: POST
**Payload**: `{"prompt": "string", "size": "string"}`

### 14. extract-data-from-uploaded-file
**Descrição**: Extrai dados de arquivos enviados
**Endpoint**: `/functions/v1/extract-data-from-uploaded-file`
**Método**: POST
**Payload**: `{"file_url": "string", "file_type": "string"}`

## Próximos Passos

1. Criar cada função individualmente seguindo os exemplos
2. Configurar variáveis de ambiente no Supabase
3. Fazer deploy das funções
4. Testar cada endpoint
5. Atualizar URLs no frontend para usar as novas Edge Functions

## Comandos Úteis

```bash
# Ver logs de uma função
supabase functions logs NOME_DA_FUNCAO

# Deletar uma função
supabase functions delete NOME_DA_FUNCAO

# Listar todas as funções
supabase functions list
```