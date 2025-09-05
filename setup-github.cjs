#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

// Cores para o terminal
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

function execCommand(command, description) {
  try {
    log(`\n${description}...`, 'cyan');
    log(`Executando: ${command}`, 'yellow');
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} concluído!`, 'green');
    return result;
  } catch (error) {
    log(`❌ Erro ao ${description.toLowerCase()}:`, 'red');
    log(error.message, 'red');
    throw error;
  }
}

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

async function setupGitHub() {
  try {
    log('🚀 Configuração do GitHub para InstaFly', 'bright');
    log('=' .repeat(50), 'blue');

    // Verificar se já existe um remote
    try {
      const remotes = execSync('git remote -v', { encoding: 'utf8' });
      if (remotes.trim()) {
        log('\n⚠️  Já existe um remote configurado:', 'yellow');
        log(remotes, 'cyan');
        const overwrite = await askQuestion('Deseja sobrescrever? (y/n): ');
        if (overwrite.toLowerCase() !== 'y') {
          log('Operação cancelada.', 'yellow');
          return;
        }
        execCommand('git remote remove origin', 'Removendo remote existente');
      }
    } catch (error) {
      // Não há remote configurado, continuar
    }

    // Solicitar informações do repositório
    log('\n📝 Informações do Repositório GitHub:', 'bright');
    const username = await askQuestion('Digite seu username do GitHub: ');
    const repoName = await askQuestion('Digite o nome do repositório (ex: instafly-app): ');
    
    if (!username || !repoName) {
      log('❌ Username e nome do repositório são obrigatórios!', 'red');
      return;
    }

    const repoUrl = `https://github.com/${username}/${repoName}.git`;
    
    log('\n🔧 Configurações:', 'bright');
    log(`Username: ${username}`, 'cyan');
    log(`Repositório: ${repoName}`, 'cyan');
    log(`URL: ${repoUrl}`, 'cyan');
    
    const confirm = await askQuestion('\nConfirmar configuração? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      log('Operação cancelada.', 'yellow');
      return;
    }

    // Configurar remote
    execCommand(`git remote add origin ${repoUrl}`, 'Configurando remote origin');
    
    // Renomear branch para main
    execCommand('git branch -M main', 'Renomeando branch para main');
    
    // Fazer push
    log('\n🚀 Fazendo upload para o GitHub...', 'bright');
    log('⚠️  Se solicitado, use seu Personal Access Token como senha!', 'yellow');
    
    try {
      execCommand('git push -u origin main', 'Enviando código para o GitHub');
      
      log('\n' + '='.repeat(50), 'green');
      log('🎉 Upload concluído com sucesso!', 'green');
      log('\n📋 Próximos passos:', 'bright');
      log('1. Acesse: https://github.com/' + username + '/' + repoName, 'cyan');
      log('2. Conecte o repositório à Vercel', 'cyan');
      log('3. Configure as variáveis de ambiente', 'cyan');
      log('4. Faça o deploy!', 'cyan');
      
    } catch (error) {
      log('\n❌ Erro no upload. Possíveis soluções:', 'red');
      log('1. Verifique se o repositório existe no GitHub', 'yellow');
      log('2. Use Personal Access Token como senha', 'yellow');
      log('3. Verifique suas permissões no repositório', 'yellow');
      log('\n🔧 Comando manual:', 'bright');
      log(`git push -u origin main`, 'cyan');
    }
    
  } catch (error) {
    log('\n❌ Erro na configuração:', 'red');
    log(error.message, 'red');
    log('\n📖 Consulte o arquivo GITHUB_SETUP.md para instruções manuais.', 'yellow');
  }
}

// Verificar se estamos em um repositório Git
try {
  execSync('git status', { stdio: 'pipe' });
  setupGitHub();
} catch (error) {
  log('❌ Este não é um repositório Git válido!', 'red');
  log('Execute primeiro: git init', 'yellow');
}