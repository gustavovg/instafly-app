# Configuração Autônoma do Supabase - InstaFly

## 1. Pré-requisitos

### Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Configure:
   - **Name**: InstaFly
   - **Database Password**: (anote esta senha)
   - **Region**: South America (São Paulo) ou mais próxima
6. Clique em "Create new project"
7. Aguarde a criação (2-3 minutos)

### Obter Credenciais
Após a criação do projeto:

1. **Project URL**: Vá em Settings > API > Project URL
2. **Anon Key**: Vá em Settings > API > Project API keys > anon public
3. **Service Role Key**: Vá em Settings > API > Project API keys > service_role (secret)

## 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=InstaFly

# External APIs (configure conforme necessário)
VITE_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
INSTAGRAM_API_TOKEN=
VITE_GOOGLE_CLIENT_ID=
```

## 3. Executar Schema do Banco de Dados

### Opção 1: Via Supabase Dashboard (Recomendado)
1. Acesse seu projeto no Supabase Dashboard
2. Vá em "SQL Editor" no menu lateral
3. Clique em "New Query"
4. Copie todo o conteúdo do arquivo `database/schema.sql`
5. Cole no editor SQL
6. Clique em "Run" para executar

### Opção 2: Via MCP do Supabase no Trae
Se o MCP estiver funcionando, você pode usar os comandos:

```javascript
// 1. Listar projetos
run_mcp({
  server_name: "mcp.config.usrlocalmcp.supabase-mcp",
  tool_name: "list_projects",
  args: {}
})

// 2. Executar schema (substitua PROJECT_ID pelo ID do seu projeto)
run_mcp({
  server_name: "mcp.config.usrlocalmcp.supabase-mcp",
  tool_name: "execute_sql",
  args: {
    project_id: "SEU_PROJECT_ID",
    query: "-- Conteúdo do schema.sql aqui"
  }
})
```

## 4. Verificar Instalação

Após executar o schema, verifique se as tabelas foram criadas:

1. No Supabase Dashboard, vá em "Table Editor"
2. Você deve ver as seguintes tabelas:
   - services
   - orders
   - coupons
   - push_subscriptions
   - whitelabel_sites
   - settings
   - payment_logs
   - notifications

## 5. Configurar Row Level Security (RLS)

O schema já inclui políticas RLS básicas, mas você pode ajustá-las:

1. Vá em "Authentication" > "Policies"
2. Revise as políticas para cada tabela
3. Ajuste conforme suas necessidades de segurança

## 6. Próximos Passos

1. **Testar Conexão**: Execute o projeto localmente para verificar se a conexão com Supabase está funcionando
2. **Configurar Edge Functions**: Siga o guia em `supabase/functions/README.md`
3. **Deploy na Vercel**: Use o arquivo `vercel.json` já configurado
4. **Migrar Dados**: Se houver dados do Base44, prepare scripts de migração

## Troubleshooting

### Erro de Conexão
- Verifique se as URLs e chaves estão corretas no `.env`
- Confirme se o projeto Supabase está ativo
- Teste a conexão no Supabase Dashboard

### Erro de Permissão
- Verifique se está usando a Service Role Key para operações administrativas
- Confirme se as políticas RLS estão configuradas corretamente

### MCP não Funciona
- Use a opção manual via Supabase Dashboard
- Verifique se o MCP está configurado corretamente no Trae

---

**Importante**: Mantenha suas chaves seguras e nunca as commite no repositório. Use sempre o arquivo `.env` que está no `.gitignore`.