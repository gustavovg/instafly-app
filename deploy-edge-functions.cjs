#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Função para fazer perguntas ao usuário
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Verificar se o Supabase CLI está instalado
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Instalar Supabase CLI
function installSupabaseCLI() {
  logStep('1', 'Instalando Supabase CLI...');
  
  logWarning('O Supabase CLI não pode ser instalado via npm global.');
  log('\nOpções de instalação:', 'yellow');
  log('\n1. Via Scoop (Windows):', 'blue');
  log('   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git', 'cyan');
  log('   scoop install supabase', 'cyan');
  
  log('\n2. Via Chocolatey (Windows):', 'blue');
  log('   choco install supabase', 'cyan');
  
  log('\n3. Via Winget (Windows):', 'blue');
  log('   winget install Supabase.cli', 'cyan');
  
  log('\n4. Download direto:', 'blue');
  log('   https://github.com/supabase/cli/releases', 'cyan');
  
  log('\n5. Via NPX (temporário):', 'blue');
  log('   npx supabase <comando>', 'cyan');
  
  // Tentar instalar via scoop
  try {
    log('\nTentando instalar via Scoop...', 'yellow');
    execSync('scoop bucket add supabase https://github.com/supabase/scoop-bucket.git', { stdio: 'pipe' });
    execSync('scoop install supabase', { stdio: 'inherit' });
    logSuccess('Supabase CLI instalado via Scoop!');
    return true;
  } catch (scoopError) {
    // Tentar via chocolatey
    try {
      log('\nTentando instalar via Chocolatey...', 'yellow');
      execSync('choco install supabase -y', { stdio: 'inherit' });
      logSuccess('Supabase CLI instalado via Chocolatey!');
      return true;
    } catch (chocoError) {
      // Tentar via winget
      try {
        log('\nTentando instalar via Winget...', 'yellow');
        execSync('winget install Supabase.cli', { stdio: 'inherit' });
        logSuccess('Supabase CLI instalado via Winget!');
        return true;
      } catch (wingetError) {
        logError('\nNão foi possível instalar automaticamente.');
        log('\nPor favor, instale manualmente usando uma das opções acima.', 'yellow');
        log('Documentação: https://supabase.com/docs/guides/cli/getting-started', 'blue');
        return false;
      }
    }
  }
}

// Verificar se existe arquivo .env
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    logWarning('Arquivo .env não encontrado!');
    return false;
  }
  return true;
}

// Ler variáveis do .env
function loadEnvVariables() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/["']/g, '');
    }
  });
  
  return envVars;
}

// Inicializar projeto Supabase
async function initSupabaseProject() {
  logStep('2', 'Configurando projeto Supabase...');
  
  // Verificar se já existe supabase/config.toml
  const configPath = path.join(process.cwd(), 'supabase', 'config.toml');
  if (fs.existsSync(configPath)) {
    logSuccess('Projeto Supabase já inicializado!');
    return true;
  }
  
  try {
    // Inicializar projeto
    execSync('supabase init', { stdio: 'inherit' });
    logSuccess('Projeto Supabase inicializado!');
    return true;
  } catch (error) {
    logError('Erro ao inicializar projeto Supabase');
    return false;
  }
}

// Fazer login no Supabase
async function loginSupabase() {
  logStep('3', 'Fazendo login no Supabase...');
  
  try {
    // Verificar se já está logado
    execSync('supabase projects list', { stdio: 'pipe' });
    logSuccess('Já está logado no Supabase!');
    return true;
  } catch (error) {
    // Não está logado, fazer login
    log('Você precisa fazer login no Supabase.', 'yellow');
    log('Isso abrirá seu navegador para autenticação.', 'yellow');
    
    const proceed = await askQuestion('Deseja continuar? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      logError('Login cancelado pelo usuário');
      return false;
    }
    
    try {
      execSync('supabase login', { stdio: 'inherit' });
      logSuccess('Login realizado com sucesso!');
      return true;
    } catch (loginError) {
      logError('Erro ao fazer login no Supabase');
      return false;
    }
  }
}

// Listar projetos e permitir seleção
async function selectProject() {
  logStep('4', 'Selecionando projeto...');
  
  try {
    const projectsOutput = execSync('supabase projects list', { encoding: 'utf8' });
    log('Projetos disponíveis:', 'blue');
    log(projectsOutput);
    
    const projectId = await askQuestion('Digite o ID do projeto (ou pressione Enter para usar o do .env): ');
    
    if (projectId) {
      return projectId;
    } else {
      // Tentar usar do .env
      if (checkEnvFile()) {
        const envVars = loadEnvVariables();
        const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
        if (supabaseUrl) {
          // Extrair project ID da URL
          const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
          if (match) {
            const extractedId = match[1];
            log(`Usando projeto do .env: ${extractedId}`, 'green');
            return extractedId;
          }
        }
      }
      
      logError('Não foi possível determinar o ID do projeto');
      return null;
    }
  } catch (error) {
    logError('Erro ao listar projetos');
    return null;
  }
}

// Fazer link com o projeto
async function linkProject(projectId) {
  logStep('5', `Conectando ao projeto ${projectId}...`);
  
  try {
    execSync(`supabase link --project-ref ${projectId}`, { stdio: 'inherit' });
    logSuccess('Projeto conectado com sucesso!');
    return true;
  } catch (error) {
    logError('Erro ao conectar ao projeto');
    return false;
  }
}

// Listar Edge Functions disponíveis
function listEdgeFunctions() {
  const functionsDir = path.join(process.cwd(), 'supabase', 'functions');
  if (!fs.existsSync(functionsDir)) {
    return [];
  }
  
  return fs.readdirSync(functionsDir)
    .filter(item => {
      const itemPath = path.join(functionsDir, item);
      return fs.statSync(itemPath).isDirectory() && item !== 'README.md';
    });
}

// Deploy das Edge Functions
async function deployEdgeFunctions() {
  logStep('6', 'Fazendo deploy das Edge Functions...');
  
  const functions = listEdgeFunctions();
  if (functions.length === 0) {
    logWarning('Nenhuma Edge Function encontrada!');
    return true;
  }
  
  log(`Encontradas ${functions.length} Edge Functions:`, 'blue');
  functions.forEach(func => log(`  - ${func}`, 'blue'));
  
  const deployAll = await askQuestion('Deseja fazer deploy de todas? (y/n): ');
  
  if (deployAll.toLowerCase() === 'y') {
    // Deploy de todas as funções
    try {
      execSync('supabase functions deploy', { stdio: 'inherit' });
      logSuccess('Todas as Edge Functions foram deployadas!');
      return true;
    } catch (error) {
      logError('Erro ao fazer deploy das Edge Functions');
      return false;
    }
  } else {
    // Deploy individual
    for (const func of functions) {
      const deploy = await askQuestion(`Deploy ${func}? (y/n): `);
      if (deploy.toLowerCase() === 'y') {
        try {
          execSync(`supabase functions deploy ${func}`, { stdio: 'inherit' });
          logSuccess(`${func} deployada com sucesso!`);
        } catch (error) {
          logError(`Erro ao fazer deploy de ${func}`);
        }
      }
    }
    return true;
  }
}

// Configurar variáveis de ambiente no Supabase
async function configureEnvironmentVariables() {
  logStep('7', 'Configurando variáveis de ambiente...');
  
  if (!checkEnvFile()) {
    logWarning('Arquivo .env não encontrado. Pulando configuração de variáveis.');
    return true;
  }
  
  const envVars = loadEnvVariables();
  const supabaseVars = Object.keys(envVars).filter(key => 
    key.includes('MERCADOPAGO') || 
    key.includes('WHATSAPP') || 
    key.includes('OPENAI') || 
    key.includes('ANTHROPIC') || 
    key.includes('GOOGLE') || 
    key.includes('INSTAGRAM') || 
    key.includes('VAPID')
  );
  
  if (supabaseVars.length === 0) {
    logWarning('Nenhuma variável de ambiente relevante encontrada.');
    return true;
  }
  
  log(`Encontradas ${supabaseVars.length} variáveis para configurar:`, 'blue');
  supabaseVars.forEach(key => log(`  - ${key}`, 'blue'));
  
  const configure = await askQuestion('Deseja configurar essas variáveis no Supabase? (y/n): ');
  
  if (configure.toLowerCase() === 'y') {
    for (const key of supabaseVars) {
      try {
        execSync(`supabase secrets set ${key}="${envVars[key]}"`, { stdio: 'inherit' });
        logSuccess(`${key} configurada!`);
      } catch (error) {
        logError(`Erro ao configurar ${key}`);
      }
    }
  }
  
  return true;
}

// Função principal
async function main() {
  log('🚀 Deploy Automatizado das Edge Functions do Supabase', 'bright');
  log('=' .repeat(60), 'cyan');
  
  try {
    // 1. Verificar/Instalar Supabase CLI
    if (!checkSupabaseCLI()) {
      if (!installSupabaseCLI()) {
        process.exit(1);
      }
    } else {
      logSuccess('Supabase CLI já está instalado!');
    }
    
    // 2. Inicializar projeto
    if (!await initSupabaseProject()) {
      process.exit(1);
    }
    
    // 3. Fazer login
    if (!await loginSupabase()) {
      process.exit(1);
    }
    
    // 4. Selecionar projeto
    const projectId = await selectProject();
    if (!projectId) {
      process.exit(1);
    }
    
    // 5. Conectar ao projeto
    if (!await linkProject(projectId)) {
      process.exit(1);
    }
    
    // 6. Deploy das Edge Functions
    if (!await deployEdgeFunctions()) {
      process.exit(1);
    }
    
    // 7. Configurar variáveis de ambiente
    if (!await configureEnvironmentVariables()) {
      process.exit(1);
    }
    
    log('\n' + '=' .repeat(60), 'cyan');
    logSuccess('🎉 Deploy concluído com sucesso!');
    log('\nPróximos passos:', 'yellow');
    log('1. Teste as Edge Functions no Supabase Dashboard', 'blue');
    log('2. Configure os webhooks necessários', 'blue');
    log('3. Teste a integração com sua aplicação', 'blue');
    
  } catch (error) {
    logError(`Erro inesperado: ${error.message}`);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkSupabaseCLI,
  installSupabaseCLI,
  deployEdgeFunctions
};