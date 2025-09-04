# Guia de Deploy - InstaFly

## Migração Base44 → Vercel + Supabase

Este projeto foi migrado do Base44 para uma arquitetura moderna usando Vercel + Supabase.

## Pré-requisitos

1. **Conta no Supabase** - [supabase.com](https://supabase.com)
2. **Conta na Vercel** - [vercel.com](https://vercel.com)
3. **Repositório Git** (GitHub, GitLab, etc.)

## Configuração do Supabase

### 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Configure:
   - **Name**: InstaFly
   - **Database Password**: (senha segura)
   - **Region**: Mais próxima dos usuários

### 2. Obter Credenciais
Após criar o projeto, vá em **Settings > API** e anote:
- **Project URL**: `https://xxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configurar Edge Functions
As seguintes Edge Functions precisam ser criadas no Supabase:

- `get-instagram-profile`
- `process-order`
- `create-payment`
- `webhook-mercadopago`
- `sync-order-status`
- `send-whatsapp`
- `send-push-notification`
- `auto-sync-orders`
- `test-evolution-connection`
- `process-whatsapp-notifications`
- `invoke-llm`
- `send-email`
- `generate-image`
- `extract-data-from-uploaded-file`

## Configuração da Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório Git
4. Selecione o repositório do InstaFly

### 2. Configurar Variáveis de Ambiente
Na Vercel, vá em **Settings > Environment Variables** e adicione:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Compatibilidade (React)
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Domínio Principal
REACT_APP_MAIN_DOMAIN=seu-dominio.vercel.app

# APIs Externas (se necessário)
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_chave_evolution
```

### 3. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL gerada

## Estrutura do Banco de Dados

O schema do banco precisa ser criado no Supabase. Execute o SQL disponível em `database/schema.sql`.

### Tabelas Principais:
- `orders` - Pedidos
- `services` - Serviços disponíveis
- `coupons` - Cupons de desconto
- `push_subscriptions` - Notificações push
- `whitelabel_sites` - Sites white label
- `settings` - Configurações do sistema

## Funcionalidades Migradas

✅ **Concluído:**
- Sistema de pedidos
- Integração Mercado Pago
- Notificações WhatsApp
- Validação de cupons
- Push notifications
- White label
- Painel administrativo

## Próximos Passos

1. **Criar Schema do Banco** - Executar SQL no Supabase
2. **Migrar Dados** - Transferir dados do Base44
3. **Testar Funcionalidades** - Validar todas as features
4. **Configurar Domínio** - Apontar domínio personalizado

## Suporte

Para dúvidas sobre a migração, consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- Arquivo `src/components/MigrationGuide.jsx` no projeto