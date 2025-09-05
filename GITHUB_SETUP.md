# 🚀 Guia de Upload para GitHub

Seu projeto InstaFly está pronto para ser enviado ao GitHub! Siga os passos abaixo:

## 📋 Status Atual
- ✅ Repositório Git inicializado
- ✅ Primeiro commit realizado
- ✅ Arquivos sensíveis (.env) protegidos pelo .gitignore
- ⏳ Aguardando configuração do repositório remoto

## 🔧 Opções de Upload

### Opção 1: Criar Novo Repositório no GitHub (Recomendado)

1. **Acesse o GitHub:**
   - Vá para [github.com](https://github.com)
   - Faça login na sua conta

2. **Crie um novo repositório:**
   - Clique no botão "+" no canto superior direito
   - Selecione "New repository"
   - Nome sugerido: `instafly-app`
   - Descrição: "InstaFly - Plataforma de automação para redes sociais com integração Supabase"
   - Mantenha como **Público** ou **Privado** (sua escolha)
   - **NÃO** marque "Initialize this repository with a README"
   - Clique em "Create repository"

3. **Configure o remote e faça o push:**
   ```bash
   # Substitua SEU_USUARIO pelo seu username do GitHub
   git remote add origin https://github.com/SEU_USUARIO/instafly-app.git
   git branch -M main
   git push -u origin main
   ```

### Opção 2: Usar Repositório Existente

Se você já tem um repositório:
```bash
# Substitua pela URL do seu repositório
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

## 🛠️ Scripts Prontos

Após criar o repositório no GitHub, execute um dos comandos abaixo:

### Para repositório público:
```bash
# Exemplo com nome "instafly-app"
git remote add origin https://github.com/SEU_USUARIO/instafly-app.git
git branch -M main
git push -u origin main
```

### Para repositório privado:
```bash
# Mesmo comando, mas o repositório será privado
git remote add origin https://github.com/SEU_USUARIO/instafly-app.git
git branch -M main
git push -u origin main
```

## 🔐 Autenticação

Se for solicitado login:
- **Username:** Seu username do GitHub
- **Password:** Use um Personal Access Token (não a senha da conta)

### Como criar um Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Classic
3. Selecione escopo: `repo` (acesso completo aos repositórios)
4. Copie o token gerado

## 📁 Estrutura que será enviada

```
instafly-app/
├── 📂 src/                    # Código fonte da aplicação
├── 📂 supabase/              # Edge Functions e configurações
├── 📂 database/              # Schema do banco de dados
├── 📄 package.json           # Dependências e scripts
├── 📄 vite.config.js         # Configuração do Vite
├── 📄 vercel.json           # Configuração da Vercel
├── 📄 DEPLOY_EDGE_FUNCTIONS.md # Guia de deploy
├── 📄 EDGE_FUNCTIONS.md      # Documentação das funções
└── 📄 README.md             # Documentação do projeto
```

## ✅ Próximos Passos

Após o upload para o GitHub:
1. 🔗 **Conectar à Vercel:** Importe o repositório na Vercel
2. ⚙️ **Configurar variáveis:** Configure as variáveis de ambiente na Vercel
3. 🚀 **Deploy:** Faça o primeiro deploy
4. 🧪 **Teste:** Verifique se tudo está funcionando

## 🆘 Problemas Comuns

### Erro de autenticação:
```bash
# Configure suas credenciais globalmente
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### Erro "repository not found":
- Verifique se o repositório foi criado corretamente
- Confirme se a URL está correta
- Verifique se você tem permissões no repositório

### Erro de push:
```bash
# Se houver conflitos, force o push (cuidado!)
git push -f origin main
```

---

**💡 Dica:** Após o upload, você poderá acessar seu código em `https://github.com/SEU_USUARIO/instafly-app`