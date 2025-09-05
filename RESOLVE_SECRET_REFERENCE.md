# Resolver Referência ao Segredo Inexistente na Vercel

## Problema
O deploy está falando com o erro:
```
Error: Environment Variable "VITE_SUPABASE_URL" references Secret "supabase-url", which does not exist.
```

## Causa
Embora tenhamos configurado todas as variáveis de ambiente corretamente via CLI, ainda existe uma referência interna a um segredo chamado "supabase-url" que não existe.

## Solução

### Passo 1: Acessar o Dashboard da Vercel
1. Acesse https://vercel.com/dashboard
2. Navegue até o projeto `instafly-app`
3. Vá para a aba **Settings**
4. Clique em **Environment Variables**

### Passo 2: Verificar Referências de Segredos
1. Procure por qualquer variável que tenha uma referência a segredo
2. Especificamente, procure por `VITE_SUPABASE_URL` que pode estar referenciando um segredo
3. Se encontrar, clique nos três pontos (...) e selecione **Edit**

### Passo 3: Corrigir a Referência
1. Se a variável estiver referenciando um segredo, altere para o valor direto:
   - **VITE_SUPABASE_URL**: `https://ezatxegbvxskfvnsfnva.supabase.co`
2. Certifique-se de que está configurada para todos os ambientes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

### Passo 4: Verificar Outras Variáveis
Certifique-se de que todas as variáveis estão com valores diretos (não referências):

- **VITE_SUPABASE_URL**: `https://ezatxegbvxskfvnsfnva.supabase.co`
- **VITE_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE5MjIsImV4cCI6MjA3MjUzNzkyMn0.Ik2WimRUmyQHrlbItBsiFsh9Z4aDD-eFd92S1OJILDs`
- **SUPABASE_SERVICE_ROLE_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTkyMiwiZXhwIjoyMDcyNTM3OTIyfQ.UyfuWHICCStKVjY1MXyakd9tvcfONqH4SC5QT2fKd34`
- **VITE_APP_URL**: `https://instafly-app.vercel.app` (Production/Preview) ou `http://localhost:5173` (Development)
- **VITE_APP_NAME**: `Instafly`

### Passo 5: Salvar e Testar
1. Salve todas as alterações
2. Aguarde alguns minutos para as mudanças serem aplicadas
3. Tente o deploy novamente:
   ```bash
   npx vercel --prod
   ```

## Observações
- O problema pode estar relacionado a configurações antigas que criaram referências a segredos
- A interface web da Vercel às vezes mantém referências que o CLI não consegue limpar
- Certifique-se de que não há variáveis duplicadas ou com nomes similares

## Próximos Passos
Após resolver este problema:
1. Realizar o primeiro deploy em produção
2. Testar a aplicação em produção
3. Verificar se todas as funcionalidades estão funcionando corretamente