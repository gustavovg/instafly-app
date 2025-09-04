# 🚀 Deploy das Edge Functions - InstaFly

Guia completo para fazer o deploy das Edge Functions do Supabase de forma automatizada.

## 📋 Pré-requisitos

- Node.js instalado
- Conta no Supabase
- Projeto criado no Supabase
- Arquivo `.env` configurado com as credenciais do Supabase

## 🎯 Deploy Automatizado

### Opção 1: Script Automatizado (Recomendado)

```bash
# Deploy todas as Edge Functions (requer Supabase CLI instalado)
npm run deploy:functions

# Ou usando o script NPX (sem instalação global) - RECOMENDADO
npm run deploy:functions:npx
```

> ✅ **Status**: Deploy realizado com sucesso! Todas as 13 Edge Functions foram deployadas no projeto Supabase.

O script irá:
1. ✅ Verificar/instalar o Supabase CLI
2. ✅ Inicializar o projeto Supabase
3. ✅ Fazer login no Supabase
4. ✅ Conectar ao seu projeto
5. ✅ Fazer deploy de todas as Edge Functions
6. ✅ Configurar variáveis de ambiente

### Opção 2: Comandos Manuais

```bash
# 1. Instalar Supabase CLI (se não estiver instalado)
npm install -g supabase

# 2. Fazer login no Supabase
npm run supabase:login
# ou
supabase login

# 3. Conectar ao projeto
npm run supabase:link
# ou
supabase link --project-ref SEU_PROJECT_ID

# 4. Deploy de todas as funções
npm run supabase:deploy
# ou
supabase functions deploy

# 5. Deploy de uma função específica
supabase functions deploy NOME_DA_FUNCAO
```

## 📁 Edge Functions Disponíveis

O projeto possui as seguintes Edge Functions:

| Função | Descrição | Arquivo |
|--------|-----------|----------|
| `create-payment` | Criação de pagamentos via MercadoPago | `supabase/functions/create-payment/index.ts` |
| `webhook-mercadopago` | Webhook para processar pagamentos | `supabase/functions/webhook-mercadopago/index.ts` |
| `send-whatsapp` | Envio de mensagens WhatsApp | `supabase/functions/send-whatsapp/index.ts` |
| `test-evolution-connection` | Teste de conexão Evolution API | `supabase/functions/test-evolution-connection/index.ts` |
| `sync-order-status` | Sincronização de status de pedidos | `supabase/functions/sync-order-status/index.ts` |
| `send-push-notification` | Envio de notificações push | `supabase/functions/send-push-notification/index.ts` |
| `auto-sync-orders` | Sincronização automática de pedidos | `supabase/functions/auto-sync-orders/index.ts` |
| `process-whatsapp-notifications` | Processamento de notificações WhatsApp | `supabase/functions/process-whatsapp-notifications/index.ts` |
| `invoke-llm` | Integração com modelos de linguagem | `supabase/functions/invoke-llm/index.ts` |
| `get-instagram-insights` | Obtenção de insights do Instagram | `supabase/functions/get-instagram-insights/index.ts` |
| `manage-user-subscriptions` | Gerenciamento de assinaturas | `supabase/functions/manage-user-subscriptions/index.ts` |

## 🔧 Configuração de Variáveis de Ambiente

### Variáveis Necessárias

Certifique-se de que seu arquivo `.env` contém:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=seu-access-token
MERCADOPAGO_PUBLIC_KEY=sua-public-key

# WhatsApp/Evolution API
WHATSAPP_API_URL=https://sua-evolution-api.com
WHATSAPP_API_KEY=sua-api-key
WHATSAPP_INSTANCE_NAME=sua-instancia

# OpenAI (opcional)
OPENAI_API_KEY=sua-openai-key

# Anthropic (opcional)
ANTHROPIC_API_KEY=sua-anthropic-key

# Google AI (opcional)
GOOGLE_AI_API_KEY=sua-google-ai-key

# Instagram (opcional)
INSTAGRAM_ACCESS_TOKEN=seu-instagram-token
INSTAGRAM_APP_ID=seu-app-id
INSTAGRAM_APP_SECRET=seu-app-secret

# VAPID Keys para Push Notifications (opcional)
VAPID_PUBLIC_KEY=sua-vapid-public-key
VAPID_PRIVATE_KEY=sua-vapid-private-key
```

### Configurar no Supabase

O script automatizado irá configurar essas variáveis no Supabase, ou você pode fazer manualmente:

```bash
# Configurar uma variável específica
supabase secrets set MERCADOPAGO_ACCESS_TOKEN="seu-token"

# Listar variáveis configuradas
supabase secrets list
```

## 🧪 Testando as Edge Functions

### Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para seu projeto
3. Navegue até "Edge Functions"
4. Teste cada função individualmente

### Via cURL

```bash
# Exemplo: Testar conexão Evolution API
curl -X POST 'https://seu-projeto.supabase.co/functions/v1/test-evolution-connection' \
  -H 'Authorization: Bearer sua-anon-key' \
  -H 'Content-Type: application/json'

# Exemplo: Criar pagamento
curl -X POST 'https://seu-projeto.supabase.co/functions/v1/create-payment' \
  -H 'Authorization: Bearer sua-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 10.00,
    "description": "Teste de pagamento",
    "user_id": "123"
  }'
```

## 🔍 Monitoramento e Logs

```bash
# Ver status do projeto
npm run supabase:status

# Ver logs das funções
supabase functions logs

# Ver logs de uma função específica
supabase functions logs --function-name NOME_DA_FUNCAO
```

## 🚨 Solução de Problemas

### Erro: "supabase command not found"

```bash
# Instalar via npm
npm install -g supabase

# Ou via scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Erro: "Not logged in"

```bash
# Fazer login
supabase login
```

### Erro: "Project not linked"

```bash
# Conectar ao projeto
supabase link --project-ref SEU_PROJECT_ID
```

### Erro: "Function deployment failed"

1. Verifique se o arquivo `index.ts` existe na pasta da função
2. Verifique se não há erros de sintaxe no código
3. Verifique se todas as dependências estão corretas
4. Tente fazer deploy de uma função por vez

### Erro: "Environment variables not set"

1. Verifique se o arquivo `.env` existe
2. Configure as variáveis no Supabase:
   ```bash
   supabase secrets set VARIAVEL="valor"
   ```

## 📚 Recursos Adicionais

- [Documentação do Supabase CLI](https://supabase.com/docs/guides/cli)
- [Documentação das Edge Functions](https://supabase.com/docs/guides/functions)
- [Exemplos de Edge Functions](https://github.com/supabase/supabase/tree/master/examples/edge-functions)

## 🎉 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste todas as funções no Dashboard
2. ✅ Configure os webhooks necessários
3. ✅ Integre as funções com sua aplicação
4. ✅ Configure monitoramento e alertas
5. ✅ Documente os endpoints para sua equipe

---

**💡 Dica:** Use o script automatizado `npm run deploy:functions` para uma experiência mais suave e menos propensa a erros!