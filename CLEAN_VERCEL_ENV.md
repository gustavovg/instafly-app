# Limpeza das Variáveis de Ambiente na Vercel

## Problema Identificado
O deploy está falando devido a variáveis de ambiente duplicadas e referências incorretas a segredos inexistentes. O CLI da Vercel não está conseguindo resolver completamente o problema.

## Solução: Limpeza via Interface Web

### Passo 1: Acessar o Painel da Vercel
1. Acesse: https://vercel.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto `instafly-app`

### Passo 2: Limpar Todas as Variáveis
1. Vá para a aba **Settings**
2. Clique em **Environment Variables** no menu lateral
3. **REMOVA TODAS** as variáveis existentes:
   - Clique no ícone de lixeira (🗑️) ao lado de cada variável
   - Confirme a remoção
   - Repita para todas as variáveis duplicadas

### Passo 3: Adicionar Variáveis Corretas
Após limpar tudo, adicione apenas estas variáveis:

#### Variáveis Essenciais do Supabase:
```
Nome: VITE_SUPABASE_URL
Valor: https://ezatxegbvxskfvnsfnva.supabase.co
Ambientes: Production, Preview, Development
```

```
Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE5MjIsImV4cCI6MjA3MjUzNzkyMn0.Ik2WimRUmyQHrlbItBsiFsh9Z4aDD-eFd92S1OJILDs
Ambientes: Production, Preview, Development
```

```
Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTkyMiwiZXhwIjoyMDcyNTM3OTIyfQ.UyfuWHICCStKVjY1MXyakd9tvcfONqH4SC5QT2fKd34
Ambientes: Production, Preview, Development
```

#### Variáveis da Aplicação:
```
Nome: VITE_APP_URL
Valor: https://instafly-app.vercel.app
Ambientes: Production, Preview, Development
```

```
Nome: VITE_APP_NAME
Valor: InstaFly
Ambientes: Production, Preview, Development
```

### Passo 4: Verificar e Deploy
1. Após adicionar todas as variáveis, verifique se não há duplicatas
2. Certifique-se de que nenhuma variável está referenciando segredos
3. Clique em **Save** para cada variável
4. Vá para a aba **Deployments**
5. Clique em **Redeploy** no último deployment

### Passo 5: Alternativa via CLI (após limpeza)
Se preferir, após limpar via interface, você pode tentar o deploy via CLI:
```bash
npx vercel --prod
```

## Verificação Final
Após o deploy bem-sucedido:
1. Acesse a URL do projeto
2. Verifique se a aplicação carrega corretamente
3. Teste a conexão com o Supabase

## Próximos Passos
- Configurar APIs opcionais (Mercado Pago, WhatsApp, Instagram, Google)
- Testar funcionalidades em produção
- Migrar dados do Base44

---
**Importante**: Mantenha as chaves do Supabase seguras e nunca as compartilhe publicamente.