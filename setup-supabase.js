#!/usr/bin/env node

/**
 * Script de Configuração Automática do Supabase - InstaFly
 * 
 * Este script ajuda a configurar e testar a conexão com o Supabase
 * Execute: node setup-supabase.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Função para criar arquivo .env
function createEnvFile(config) {
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${config.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${config.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey}

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

# React App (para compatibilidade)
REACT_APP_SUPABASE_URL=${config.supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${config.anonKey}
REACT_APP_MAIN_DOMAIN=localhost:5173
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Arquivo .env criado com sucesso!');
}

// Função para testar conexão com Supabase
async function testSupabaseConnection(config) {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    
    // Simular teste de conexão (você pode implementar um teste real aqui)
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(config.supabaseUrl, config.anonKey);
    
    // Teste simples - tentar fazer uma query
    const { data, error } = await supabase.from('services').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não existe (ok para setup inicial)
      throw error;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    return true;
  } catch (error) {
    console.log('❌ Erro na conexão:', error.message);
    return false;
  }
}

// Função para ler e preparar o schema SQL
function prepareSchema() {
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema SQL carregado!');
    return schema;
  } catch (error) {
    console.log('❌ Erro ao carregar schema:', error.message);
    return null;
  }
}

// Função principal
async function main() {
  console.log('🚀 Configuração Automática do Supabase - InstaFly\n');
  
  try {
    // Verificar se .env já existe
    if (fs.existsSync('.env')) {
      const overwrite = await question('Arquivo .env já existe. Sobrescrever? (s/n): ');
      if (overwrite.toLowerCase() !== 's') {
        console.log('Configuração cancelada.');
        rl.close();
        return;
      }
    }
    
    console.log('\n📋 Insira as credenciais do seu projeto Supabase:');
    console.log('(Você pode encontrá-las em: Settings > API no dashboard do Supabase)\n');
    
    const config = {
      supabaseUrl: await question('Project URL (https://xxx.supabase.co): '),
      anonKey: await question('Anon Key (public): '),
      serviceRoleKey: await question('Service Role Key (secret): ')
    };
    
    // Validar inputs básicos
    if (!config.supabaseUrl || !config.anonKey || !config.serviceRoleKey) {
      console.log('❌ Todas as credenciais são obrigatórias!');
      rl.close();
      return;
    }
    
    // Criar arquivo .env
    createEnvFile(config);
    
    // Testar conexão (opcional, requer @supabase/supabase-js instalado)
    const testConnection = await question('\nTestar conexão agora? (s/n): ');
    if (testConnection.toLowerCase() === 's') {
      try {
        await testSupabaseConnection(config);
      } catch (error) {
        console.log('⚠️  Não foi possível testar a conexão automaticamente.');
        console.log('Certifique-se de que @supabase/supabase-js está instalado.');
      }
    }
    
    // Preparar schema
    const schema = prepareSchema();
    if (schema) {
      console.log('\n📄 Schema SQL preparado!');
      console.log('\n📋 Próximos passos:');
      console.log('1. Acesse seu projeto no Supabase Dashboard');
      console.log('2. Vá em "SQL Editor"');
      console.log('3. Cole o conteúdo do arquivo database/schema.sql');
      console.log('4. Execute o SQL para criar as tabelas');
      console.log('\nOu execute: npm run setup:db (se configurado)');
    }
    
    console.log('\n✅ Configuração concluída!');
    console.log('\n🔧 Para continuar:');
    console.log('- Execute: npm install (se ainda não executou)');
    console.log('- Execute: npm run dev (para iniciar o projeto)');
    console.log('- Consulte SUPABASE_SETUP.md para mais detalhes');
    
  } catch (error) {
    console.log('❌ Erro durante a configuração:', error.message);
  } finally {
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createEnvFile, testSupabaseConnection, prepareSchema };