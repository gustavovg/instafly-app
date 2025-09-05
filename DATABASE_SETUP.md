# Configuração do Banco de Dados InstaFly

Este guia explica como configurar o banco de dados do InstaFly no Supabase.

## Arquivos SQL Disponíveis

- `database/schema.sql` - Schema original/antigo (mais simples)
- `supabase-schema.sql` - Schema novo com recursos avançados
- `seed-data.sql` - Dados de exemplo (compatível com schema antigo)

## Qual Schema Usar?

### Se seu banco já foi criado:
- **Use apenas `seed-data.sql`** para adicionar dados de exemplo
- O arquivo já foi ajustado para funcionar com o schema existente

### Para novo banco:
- **Opção 1 (Recomendada):** Use `database/schema.sql` + `seed-data.sql`
- **Opção 2 (Avançada):** Use `supabase-schema.sql` (mas precisará ajustar o seed-data.sql)

## Ordem de Execução

**Para banco existente:**
1. Execute apenas `seed-data.sql`

**Para novo banco:**
1. **Primeiro:** Execute `database/schema.sql` OU `supabase-schema.sql`
2. **Segundo:** Execute `seed-data.sql`

### Detalhes dos Scripts

**Arquivo:** `database/schema.sql` (Recomendado)

- Acesse o SQL Editor do Supabase
- Copie e cole todo o conteúdo do arquivo `database/schema.sql`
- Execute o script
- Este script criará:
  - Todas as tabelas necessárias
  - Triggers e funções básicas
  - Políticas de segurança (RLS)

**Arquivo:** `seed-data.sql` (Opcional)

- Após executar com sucesso o schema
- Copie e cole o conteúdo do arquivo `seed-data.sql`
- Execute o script
- Este script adicionará:
  - Configurações básicas
  - Serviços de exemplo
  - Cupons de desconto
  - FAQs básicas

## Verificação

Após executar os scripts, verifique se as seguintes tabelas foram criadas:

- `users`
- `settings`
- `services`
- `orders`
- `coupons`
- `affiliates`
- `affiliate_earnings`
- `customer_wallets`
- `wallet_transactions`
- `subscription_plans`
- `customer_subscriptions`
- `tickets`
- `ticket_messages`
- `faqs`
- `api_keys`
- `notifications`

- `service_ratings`
- `whatsapp_templates`

## Solução de Problemas

### Erro: "relation does not exist"

- Certifique-se de que executou o `supabase-schema.sql` primeiro
- Verifique se não houve erros na execução do schema principal
- Execute os scripts um por vez, não em lote

### Erro: "already exists" (Exemplo: relation "settings" already exists)

**Causa:** Você está tentando executar o `supabase-schema.sql` novamente em um banco que já possui as tabelas.

**Soluções:**

1. **Se você quer apenas adicionar dados extras:**
   - Pule o `supabase-schema.sql`
   - Execute apenas o `seed-data.sql`

2. **Se você quer recriar tudo do zero:**
   - Vá para Settings > Database no Supabase
   - Clique em "Reset Database" (CUIDADO: isso apaga todos os dados)
   - Depois execute o `supabase-schema.sql`

3. **Se você quer manter os dados existentes:**
   - Execute apenas as partes do script que ainda não existem
   - Ou execute apenas o `seed-data.sql` para adicionar dados extras

**Nota:** É normal ver este erro se executar o script novamente. Os scripts principais usam `CREATE TABLE` sem `IF NOT EXISTS` para garantir a estrutura correta.

### Erro de permissões

- Certifique-se de estar logado como proprietário do projeto
- Verifique se está executando no SQL Editor correto do Supabase

## Configurações Pós-Instalação

Após executar os scripts, configure as seguintes variáveis no painel de configurações:

1. **APIs Externas:**
   - `mercadopago_access_token`
   - `evolution_api_url`
   - `evolution_api_key`

2. **Push Notifications:**
   - `vapid_public_key`
   - `vapid_private_key`

3. **Sincronização:**
   - `sync_interval_minutes` (padrão: 10)

Estas configurações podem ser atualizadas através do painel administrativo da aplicação ou diretamente na tabela `settings`.