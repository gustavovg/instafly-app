# Guia Completo para Redeploy na Vercel

## Problema
Dificuldade para fazer redeploy após configurar as variáveis de ambiente.

## Métodos para Fazer Redeploy

### Método 1: Redeploy via Interface da Vercel (Recomendado)

1. **Acesse o Dashboard da Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login na sua conta
   - Clique no seu projeto InstaFly

2. **Navegue até Deployments**
   - No menu lateral, clique em **"Deployments"**
   - Você verá uma lista de todos os deploys

3. **Redeploy do Último Deploy**
   - Encontre o deploy mais recente (primeiro da lista)
   - Clique nos **três pontos (⋯)** ao lado do deploy
   - Selecione **"Redeploy"**
   - Confirme clicando em **"Redeploy"** novamente

### Método 2: Trigger via Git Push

1. **Faça uma pequena alteração no código**
   ```bash
   # No terminal do seu projeto
   echo "# Deploy trigger" >> README.md
   ```

2. **Commit e push**
   ```bash
   git add .
   git commit -m "Trigger redeploy after env vars fix"
   git push origin main
   ```

3. **A Vercel detectará automaticamente** e iniciará um novo deploy

### Método 3: Redeploy via Vercel CLI

1. **Instale a Vercel CLI** (se não tiver)
   ```bash
   npm i -g vercel
   ```

2. **Faça login**
   ```bash
   vercel login
   ```

3. **Navegue até o diretório do projeto**
   ```bash
   cd "c:\Users\Gustavo\Desktop\InstaFly\insta-fly-9b1080f2 (4)"
   ```

4. **Execute o redeploy**
   ```bash
   vercel --prod
   ```

### Método 4: Forçar Novo Deploy

1. **Na interface da Vercel**
   - Vá para **Settings** → **Git**
   - Clique em **"Deploy Hooks"**
   - Crie um novo Deploy Hook
   - Copie a URL gerada

2. **Trigger via URL**
   - Abra a URL copiada no navegador
   - Ou use curl no terminal:
   ```bash
   curl -X POST "URL_DO_DEPLOY_HOOK"
   ```

## Verificação das Variáveis de Ambiente

### Antes do Redeploy, Confirme:

1. **Acesse Settings → Environment Variables**
2. **Verifique se todas estão configuradas:**
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `VITE_APP_URL`
   - ✅ `VITE_APP_NAME`

3. **Certifique-se que:**
   - Não há referências a secrets (como `$supabase-url`)
   - Os valores são diretos (URLs e chaves completas)
   - Estão marcadas para Production, Preview e Development

## Troubleshooting

### Se o Redeploy Falhar:

1. **Verifique os Logs**
   - Na aba **"Functions"** ou **"Deployments"**
   - Clique no deploy que falhou
   - Analise os logs de erro

2. **Problemas Comuns:**
   - **Build Error**: Verifique se todas as dependências estão no `package.json`
   - **Environment Variables**: Confirme se todas estão configuradas
   - **Syntax Error**: Verifique se não há erros de sintaxe no código

3. **Limpar Cache (se necessário)**
   - No deploy, procure por opção **"Clear Cache"**
   - Ou adicione `?clearCache=1` na URL do redeploy

### Se Ainda Não Funcionar:

1. **Delete e Reimporte o Projeto**
   - Settings → General → Delete Project
   - Importe novamente do GitHub
   - Configure as variáveis de ambiente

2. **Verifique o arquivo `vercel.json`**
   - Confirme se está configurado corretamente
   - Remova configurações desnecessárias se houver

## Comandos Úteis para Debug

```bash
# Verificar status do Git
git status

# Ver último commit
git log -1

# Verificar remote
git remote -v

# Forçar push (use com cuidado)
git push --force-with-lease origin main
```

## Próximos Passos Após Redeploy

1. **Aguarde o deploy completar** (2-5 minutos)
2. **Acesse sua aplicação** na URL da Vercel
3. **Teste as funcionalidades principais:**
   - Login/Cadastro
   - Conexão com Supabase
   - Edge Functions (se aplicável)
4. **Verifique o console do navegador** para erros

## Dicas Importantes

- ⏰ **Aguarde**: Deploys podem levar alguns minutos
- 🔄 **Cache**: Limpe o cache do navegador após deploy
- 📱 **Mobile**: Teste também em dispositivos móveis
- 🔍 **Logs**: Sempre verifique os logs em caso de erro

---

**Se nenhum método funcionar, me informe qual erro específico está aparecendo para que eu possa ajudar de forma mais direcionada.**