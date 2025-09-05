# Guia para o Primeiro Deploy na Vercel

## Situação Atual

O projeto InstaFly está conectado à Vercel mas ainda não foi feito nenhum deploy. O erro atual é:

```
Error: Environment Variable "VITE_SUPABASE_URL" references Secret "supabase-url", which does not exist.
```

## Passos para Corrigir e Fazer o Primeiro Deploy

### 1. Corrigir Variáveis de Ambiente na Vercel

**Acesse o painel da Vercel:**
1. Vá para [vercel.com](https://vercel.com)
2. Entre no projeto `instafly-app`
3. Vá em **Settings** → **Environment Variables**

**Remova as configurações incorretas:**
- Delete todas as variáveis que estão referenciando segredos inexistentes
- Procure por referências como `supabase-url`, `supabase-anon-key`, etc.

**Adicione as variáveis corretas:**

#### Variáveis Essenciais (obrigatórias):
```
VITE_SUPABASE_URL=https://seuprojetosupabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
VITE_APP_URL=https://instafly-app.vercel.app
VITE_APP_NAME=InstaFly
```

#### Variáveis Opcionais (podem ficar vazias por enquanto):
```
VITE_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
INSTAGRAM_API_TOKEN=
VITE_GOOGLE_CLIENT_ID=
```

### 2. Obter as Chaves do Supabase

**Para obter as chaves do Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Fazer o Deploy

**Opção 1: Via Interface da Vercel**
1. No painel do projeto, clique em **Deployments**
2. Clique em **Create Deployment**
3. Selecione a branch `main`
4. Clique em **Deploy**

**Opção 2: Via CLI (após corrigir as variáveis)**
```bash
npx vercel --prod
```

### 4. Verificar o Deploy

Após o deploy:
1. Acesse a URL fornecida pela Vercel
2. Verifique se a aplicação carrega sem erros
3. Teste as funcionalidades básicas
4. Verifique o console do navegador para erros

## Troubleshooting

### Se o deploy falhar:
1. **Verifique os logs de build** na aba Deployments
2. **Confirme se todas as variáveis estão corretas**
3. **Verifique se não há erros de sintaxe** no código

### Erros comuns:
- **Build failed**: Geralmente erro de dependências ou sintaxe
- **Runtime error**: Problema com variáveis de ambiente
- **404 errors**: Problema de roteamento

### Se precisar de ajuda:
1. Copie os logs de erro completos
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Teste localmente com `npm run dev` antes de fazer deploy

## Próximos Passos

Após o primeiro deploy bem-sucedido:
1. Configurar as APIs opcionais (Mercado Pago, WhatsApp, etc.)
2. Testar todas as funcionalidades em produção
3. Configurar domínio personalizado (se necessário)
4. Configurar monitoramento e analytics

---

**Importante:** Nunca commite arquivos `.env` no Git. Todas as variáveis sensíveis devem ser configuradas apenas na interface da Vercel.