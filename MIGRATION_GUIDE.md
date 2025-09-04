# Guia de Migração InstaFly - Base44 → Vercel + Supabase

## 📋 Pré-requisitos

- Conta no GitHub
- Node.js 18+ instalado
- Git configurado

## 🚀 Passo 1: Configurar Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Escolha sua organização
6. Configure:
   - **Name**: `instafly-production`
   - **Database Password**: Gere uma senha forte
   - **Region**: `South America (São Paulo)`
7. Clique em "Create new project"

### 1.2 Executar Schema do Banco

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em "Run"
5. Aguarde a execução (pode levar alguns minutos)

### 1.3 Configurar Autenticação

1. Vá em **Authentication** → **Settings**
2. Em **Site URL**, adicione:
   - `http://localhost:5173` (desenvolvimento)
   - Sua URL da Vercel (será criada no próximo passo)
3. Em **Auth Providers**, configure:
   - **Email**: Habilitado
   - **Google**: 
     - Habilite o provider
     - Configure Client ID e Secret (Google Console)

### 1.4 Obter Chaves da API

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL**
   - **anon public key**
   - **service_role key** (mantenha segura!)

## 🌐 Passo 2: Configurar Vercel

### 2.1 Preparar Repositório

```bash
# No diretório do projeto
git init
git add .
git commit -m "Initial commit - migrated from Base44"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/seu-usuario/instafly.git
git push -u origin main
```

### 2.2 Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório `instafly`
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Configurar Variáveis de Ambiente

1. No painel da Vercel, vá em **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
VITE_APP_URL=https://seu-projeto.vercel.app
VITE_APP_NAME=InstaFly
```

3. Clique em "Deploy" para fazer o primeiro deploy

## 🔧 Passo 3: Instalar Dependências

```bash
# Remover node_modules e package-lock.json antigos
rm -rf node_modules package-lock.json

# Instalar novas dependências
npm install
```

## 📝 Passo 4: Configurar Ambiente Local

### 4.1 Criar arquivo .env

```bash
cp .env.example .env
```

### 4.2 Preencher variáveis no .env

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=InstaFly

# Suas chaves existentes (mantenha as mesmas)
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_chave_mercado_pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token_mercado_pago
WHATSAPP_API_URL=sua_url_whatsapp
WHATSAPP_API_TOKEN=seu_token_whatsapp
```

## 🔄 Passo 5: Refatorar Código

### 5.1 Atualizar Imports

Substitua todas as importações do Base44:

```javascript
// ANTES (Base44)
import { base44 } from './api/base44Client'
import { Order, User, Service } from './api/entities'

// DEPOIS (Supabase)
import { supabase, auth, db } from './api/supabaseClient'
```

### 5.2 Atualizar Operações de Banco

```javascript
// ANTES (Base44)
const orders = await Order.findMany({ userId: user.id })

// DEPOIS (Supabase)
const { data: orders } = await db.orders
  .select('*')
  .eq('user_id', user.id)
```

### 5.3 Atualizar Autenticação

```javascript
// ANTES (Base44)
const user = await User.signIn(email, password)

// DEPOIS (Supabase)
const { data, error } = await auth.signIn(email, password)
```

## 🧪 Passo 6: Testar Aplicação

### 6.1 Teste Local

```bash
npm run dev
```

1. Acesse `http://localhost:5173`
2. Teste funcionalidades principais:
   - Login/Registro
   - Criação de pedidos
   - Dashboard
   - Pagamentos

### 6.2 Teste em Produção

1. Acesse sua URL da Vercel
2. Teste as mesmas funcionalidades
3. Monitore logs no painel da Vercel

## 📊 Passo 7: Migrar Dados (Opcional)

### 7.1 Exportar Dados do Base44

1. Use o painel admin do Base44
2. Exporte tabelas principais:
   - Usuários
   - Pedidos
   - Serviços
   - Configurações

### 7.2 Importar para Supabase

1. No Supabase, vá em **Table Editor**
2. Para cada tabela, clique em "Insert" → "Import data from CSV"
3. Faça o mapeamento dos campos
4. Execute a importação

## 🔒 Passo 8: Configurar Segurança

### 8.1 Row Level Security (RLS)

O schema já inclui políticas RLS básicas. Revise e ajuste conforme necessário:

1. No Supabase, vá em **Authentication** → **Policies**
2. Revise as políticas criadas
3. Teste com diferentes usuários

### 8.2 Backup Automático

1. No Supabase, vá em **Settings** → **Database**
2. Configure backup automático diário
3. Defina retenção de 7 dias

## 📈 Passo 9: Monitoramento

### 9.1 Vercel Analytics

1. No painel da Vercel, habilite **Analytics**
2. Configure alertas para erros

### 9.2 Supabase Monitoring

1. No Supabase, monitore:
   - **Database** → Performance
   - **Auth** → Users growth
   - **API** → Request logs

## ✅ Checklist Final

- [ ] Supabase projeto criado e configurado
- [ ] Schema do banco executado com sucesso
- [ ] Vercel projeto deployado
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Código refatorado (Base44 → Supabase)
- [ ] Testes locais passando
- [ ] Testes em produção passando
- [ ] Dados migrados (se aplicável)
- [ ] Segurança configurada
- [ ] Monitoramento ativo

## 🆘 Solução de Problemas

### Erro de Conexão com Supabase

```javascript
// Verificar se as variáveis estão corretas
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### Erro de Build na Vercel

1. Verifique se todas as dependências estão no `package.json`
2. Confirme se o comando de build está correto
3. Verifique logs detalhados no painel da Vercel

### Problemas de Autenticação

1. Verifique se a URL do site está configurada no Supabase
2. Confirme se o Google OAuth está configurado corretamente
3. Teste com diferentes navegadores

## 💰 Custos Estimados

- **Supabase**: $0-25/mês (dependendo do uso)
- **Vercel**: $0-20/mês (dependendo do tráfego)
- **Total**: ~$45/mês (vs $200+/mês no Base44)

## 📞 Suporte

- **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: Discord do Supabase e Vercel

---

**🎉 Parabéns! Sua migração está completa!**

Agora você tem uma aplicação moderna, escalável e com custos muito menores.