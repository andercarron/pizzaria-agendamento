const fs = require('fs');
const path = require('path');

// Cria a pasta logs se não existir
const pastaLogs = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(pastaLogs)) {
    fs.mkdirSync(pastaLogs);
}

const logger = {
    info: (mensagem) => {
        const data = new Date().toISOString();
        const linha = `[${data}] INFO: ${mensagem}\n`;
        
        // Mostra no terminal
        console.log(linha.trim());
        
        // Salva no arquivo
        fs.appendFileSync(
            path.join(pastaLogs, 'app.log'),
            linha
        );
    },
    
    erro: (mensagem, erro) => {
        const data = new Date().toISOString();
        const linha = `[${data}] ERRO: ${mensagem} - ${erro?.message || erro}\n`;
        
        // Mostra no terminal (em vermelho não funciona no Windows, mas tudo bem)
        console.error(linha.trim());
        
        // Salva no arquivo
        fs.appendFileSync(
            path.join(pastaLogs, 'app.log'),
            linha
        );
    }
};

module.exports = logger;