# Correção das Variáveis de Ambiente na Vercel

## Problema Identificado
O erro `Environment Variable "VITE_SUPABASE_URL" references Secret "supabase-url", which does not exist` indica que as variáveis foram configuradas incorretamente na Vercel como referências a secrets inexistentes.

## Solução

### 1. Acesse as Configurações do Projeto na Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Acesse seu projeto InstaFly
3. Clique em **Settings** → **Environment Variables**

### 2. Remova as Configurações Incorretas
Remova todas as variáveis que estão referenciando secrets inexistentes.

### 3. Configure as Variáveis Corretamente
Adicione as seguintes variáveis de ambiente com os **valores diretos** (não como referências):

#### Variáveis Obrigatórias do Supabase:
```
VITE_SUPABASE_URL = https://ezatxegbvxskfvnsfnva.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE5MjIsImV4cCI6MjA3MjUzNzkyMn0.Ik2WimRUmyQHrlbItBsiFsh9Z4aDD-eFd92S1OJILDs
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTkyMiwiZXhwIjoyMDcyNTM3OTIyfQ.UyfuWHICCStKVjY1MXyakd9tvcfONqH4SC5QT2fKd34
```

#### Variáveis de Configuração da App:
```
VITE_APP_URL = https://seu-dominio.vercel.app
VITE_APP_NAME = InstaFly
```

#### Variáveis Opcionais (configure conforme necessário):
```
VITE_MERCADO_PAGO_PUBLIC_KEY = sua_chave_publica_mercado_pago
MERCADO_PAGO_ACCESS_TOKEN = seu_token_mercado_pago
WHATSAPP_API_URL = sua_url_whatsapp_api
WHATSAPP_API_TOKEN = seu_token_whatsapp
INSTAGRAM_API_TOKEN = seu_token_instagram
VITE_GOOGLE_CLIENT_ID = seu_google_client_id
```

### 4. Configuração Correta na Interface da Vercel

**IMPORTANTE:** Na Vercel, você deve:
1. **Nome da Variável:** Digite o nome exato (ex: `VITE_SUPABASE_URL`)
2. **Valor:** Cole o valor direto da variável (ex: `https://ezatxegbvxskfvnsfnva.supabase.co`)
3. **Environment:** Selecione `Production`, `Preview` e `Development`
4. **NÃO** use referências como `$supabase-url` ou similares

### 5. Redeploy do Projeto
Após configurar todas as variáveis:
1. Vá para a aba **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**

### 6. Verificação
Após o redeploy, acesse sua aplicação e verifique se:
- A conexão com o Supabase está funcionando
- Não há mais erros de variáveis de ambiente
- As funcionalidades básicas estão operacionais

## Dicas Importantes

1. **Segurança:** As chaves `VITE_*` são expostas no frontend, então use apenas chaves públicas
2. **Service Role Key:** Use apenas no backend/Edge Functions, nunca no frontend
3. **Backup:** Mantenha uma cópia das suas variáveis em local seguro
4. **Teste Local:** Sempre teste localmente antes do deploy

## Próximos Passos

Após corrigir as variáveis de ambiente:
1. Teste todas as funcionalidades principais
2. Verifique se as Edge Functions estão funcionando
3. Teste a integração com APIs externas (se configuradas)
4. Configure domínio personalizado (opcional)