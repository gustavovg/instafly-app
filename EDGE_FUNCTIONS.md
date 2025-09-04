# Edge Functions - InstaFly

Este documento descreve todas as Edge Functions criadas para o projeto InstaFly no Supabase.

## Funções Disponíveis

### 1. create-payment
**Arquivo:** `supabase/functions/create-payment/index.ts`

**Descrição:** Integra com o MercadoPago para criar pagamentos.

**Parâmetros:**
- `order_id` (string, obrigatório): ID do pedido
- `amount` (number, obrigatório): Valor do pagamento
- `description` (string, opcional): Descrição do pagamento
- `user_id` (string, obrigatório): ID do usuário

**Funcionalidades:**
- Validação de campos obrigatórios
- Obtenção de token do MercadoPago
- Criação do pagamento no MercadoPago
- Registro de logs no banco de dados
- Atualização do status do pedido
- Envio de notificação push

---

### 2. webhook-mercadopago
**Arquivo:** `supabase/functions/webhook-mercadopago/index.ts`

**Descrição:** Processa notificações de pagamento do MercadoPago.

**Parâmetros:**
- `id` (string): ID do pagamento no MercadoPago
- `topic` (string): Tipo de notificação

**Funcionalidades:**
- Validação do token do MercadoPago
- Obtenção de detalhes do pagamento
- Atualização do status no banco de dados
- Envio de notificações push e WhatsApp

---

### 3. send-whatsapp
**Arquivo:** `supabase/functions/send-whatsapp/index.ts`

**Descrição:** Envia mensagens via WhatsApp usando Evolution API.

**Parâmetros:**
- `message` (string, obrigatório): Mensagem a ser enviada
- `phone_number` (string, opcional): Número de telefone
- `user_id` (string, opcional): ID do usuário (para obter telefone do banco)

**Funcionalidades:**
- Validação de campos obrigatórios
- Obtenção de credenciais da Evolution API
- Formatação do número de telefone
- Envio da mensagem
- Registro de logs no banco de dados

---

### 4. test-evolution-connection
**Arquivo:** `supabase/functions/test-evolution-connection/index.ts`

**Descrição:** Testa a conexão com a Evolution API.

**Funcionalidades:**
- Verificação de instâncias
- Estado da conexão
- Obtenção de QR code (se desconectado)
- Informações da instância (se conectado)
- Registro de logs no Supabase

---

### 5. sync-order-status
**Arquivo:** `supabase/functions/sync-order-status/index.ts`

**Descrição:** Sincroniza o status de pedidos.

**Parâmetros:**
- `order_id` (string, obrigatório): ID do pedido
- `new_status` (string, obrigatório): Novo status do pedido

**Funcionalidades:**
- Validação de campos obrigatórios
- Atualização do status no banco de dados
- Criação de notificações
- Envio de notificação push
- Registro de logs da API

---

### 6. send-push-notification
**Arquivo:** `supabase/functions/send-push-notification/index.ts`

**Descrição:** Envia notificações push aos usuários.

**Parâmetros:**
- `user_id` (string, obrigatório): ID do usuário
- `title` (string, obrigatório): Título da notificação
- `message` (string, obrigatório): Mensagem da notificação
- `data` (object, opcional): Dados adicionais

**Funcionalidades:**
- Obtenção de assinaturas push ativas
- Verificação de chaves VAPID
- Envio da notificação
- Registro no banco de dados
- Tratamento de assinaturas expiradas

---

### 7. auto-sync-orders
**Arquivo:** `supabase/functions/auto-sync-orders/index.ts`

**Descrição:** Sincroniza automaticamente o status de pedidos com provedores externos.

**Funcionalidades:**
- Obtenção de pedidos pendentes/em processamento
- Simulação de verificação com provedor externo
- Atualização automática de status
- Chamada da função sync-order-status
- Registro de logs da API

---

### 8. process-whatsapp-notifications
**Arquivo:** `supabase/functions/process-whatsapp-notifications/index.ts`

**Descrição:** Processa notificações recebidas via WhatsApp.

**Parâmetros:**
- Dados do webhook da Evolution API

**Funcionalidades:**
- Processamento de diferentes tipos de eventos
- Armazenamento de mensagens recebidas
- Auto-resposta baseada no conteúdo
- Registro de logs da API

---

### 9. invoke-llm
**Arquivo:** `supabase/functions/invoke-llm/index.ts`

**Descrição:** Integração com modelos de linguagem para geração de conteúdo.

**Parâmetros:**
- `prompt` (string, obrigatório): Prompt para o modelo
- `context` (string, opcional): Contexto adicional
- `task_type` (string, opcional): Tipo de tarefa (general, customer_support, content_generation, etc.)
- `max_tokens` (number, opcional): Máximo de tokens (padrão: 500)
- `temperature` (number, opcional): Temperatura do modelo (padrão: 0.7)
- `user_id` (string, opcional): ID do usuário

**Funcionalidades:**
- Suporte a múltiplos provedores (OpenAI, Anthropic, Google AI)
- Prompts de sistema personalizados por tipo de tarefa
- Processamento de resposta baseado no tipo de tarefa
- Fallback para respostas mock quando API não configurada
- Registro de uso e logs

---

### 10. get-instagram-insights
**Arquivo:** `supabase/functions/get-instagram-insights/index.ts`

**Descrição:** Obtém métricas e insights do Instagram.

**Parâmetros:**
- `user_id` (string, obrigatório): ID do usuário
- `instagram_username` (string, opcional): Nome de usuário do Instagram
- `access_token` (string, opcional): Token de acesso do Instagram
- `metrics` (array, opcional): Métricas desejadas (padrão: ['followers', 'engagement', 'reach'])
- `period` (string, opcional): Período de análise (padrão: '7d')

**Funcionalidades:**
- Validação de token de acesso do Instagram
- Obtenção de ID da conta business
- Coleta de insights da conta
- Análise de performance de mídia
- Cálculo de métricas adicionais
- Armazenamento de insights no banco
- Fallback para dados mock quando API não configurada

---

### 11. manage-user-subscriptions
**Arquivo:** `supabase/functions/manage-user-subscriptions/index.ts`

**Descrição:** Gerencia assinaturas de usuários e notificações push.

**Parâmetros:**
- `action` (string, obrigatório): Ação a ser executada
- `user_id` (string, obrigatório): ID do usuário
- `subscription_data` (object, opcional): Dados da assinatura
- `push_subscription` (object, opcional): Dados da assinatura push

**Ações Disponíveis:**
- `subscribe_push`: Inscrever em notificações push
- `unsubscribe_push`: Cancelar notificações push
- `get_subscriptions`: Obter assinaturas do usuário
- `update_preferences`: Atualizar preferências de notificação
- `cleanup_expired`: Limpar assinaturas expiradas

**Funcionalidades:**
- Gerenciamento completo de assinaturas push
- Controle de preferências de notificação
- Limpeza automática de assinaturas expiradas
- Histórico de notificações
- Estatísticas de uso

---

## Variáveis de Ambiente Necessárias

### Supabase
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de service role do Supabase

### MercadoPago
- `MERCADOPAGO_ACCESS_TOKEN`: Token de acesso do MercadoPago
- `MERCADOPAGO_WEBHOOK_SECRET`: Segredo do webhook do MercadoPago

### WhatsApp (Evolution API)
- `EVOLUTION_API_URL`: URL da Evolution API
- `EVOLUTION_API_KEY`: Chave da Evolution API
- `EVOLUTION_INSTANCE_NAME`: Nome da instância

### Instagram
- `INSTAGRAM_APP_ID`: ID do app do Instagram
- `INSTAGRAM_APP_SECRET`: Segredo do app do Instagram

### LLM (Opcional)
- `LLM_PROVIDER`: Provedor do LLM (openai, anthropic, google)
- `LLM_API_KEY`: Chave da API do LLM
- `LLM_MODEL`: Modelo a ser usado

### Push Notifications (Opcional)
- `VAPID_PUBLIC_KEY`: Chave pública VAPID
- `VAPID_PRIVATE_KEY`: Chave privada VAPID
- `VAPID_SUBJECT`: Assunto VAPID (email ou URL)

---

## Como Usar

### 1. Deploy das Funções
```bash
# Deploy de todas as funções
supabase functions deploy

# Deploy de uma função específica
supabase functions deploy create-payment
```

### 2. Configurar Variáveis de Ambiente
```bash
# Definir variáveis no Supabase
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=your_token
supabase secrets set EVOLUTION_API_URL=your_url
# ... outras variáveis
```

### 3. Testar Funções
```bash
# Testar localmente
supabase functions serve

# Fazer requisição de teste
curl -X POST 'http://localhost:54321/functions/v1/create-payment' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"order_id":"123","amount":100,"user_id":"user123"}'
```

### 4. Monitoramento
- Logs das funções estão disponíveis no Supabase Dashboard
- Logs detalhados são armazenados na tabela `api_logs`
- Métricas de uso podem ser consultadas via SQL

---

## Próximos Passos

1. **Configurar Webhooks**: Configurar URLs de webhook no MercadoPago e Evolution API
2. **Testar Integrações**: Testar cada função individualmente
3. **Configurar Monitoramento**: Implementar alertas para falhas
4. **Otimizar Performance**: Analisar logs e otimizar consultas
5. **Documentar APIs**: Criar documentação detalhada para cada endpoint

---

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs no Supabase Dashboard
2. Consulte a tabela `api_logs` para detalhes de execução
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Teste as integrações externas (MercadoPago, Evolution API, etc.)