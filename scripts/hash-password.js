const bcrypt = require('bcryptjs');

// Função para gerar hash de uma senha
async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Senha original: ${password}`);
  console.log(`Hash gerado: ${hash}`);
  return hash;
}

// Pegar a senha dos argumentos da linha de comando
const password = process.argv[2];

if (!password) {
  console.log('Uso: node hash-password.js <senha>');
  console.log('Exemplo: node hash-password.js 123456');
  process.exit(1);
}

hashPassword(password).catch(console.error);
