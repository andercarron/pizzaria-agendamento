const jwt = require('jsonwebtoken');

// Em produção, use uma variável de ambiente!
const SEGREDO_JWT = 'pizzaria_super_secreta_2024';

const auth = {
    
    // GERAR TOKEN (usado no login)
    gerarToken: (cliente) => {
        return jwt.sign(
            { id: cliente.id,
                 email: cliente.email,
                tipo: cliente.tipo }, // Payload do token
            SEGREDO_JWT,
            { expiresIn: '7d' } // Token expira em 7 dias
        );
    },
    
    // MIDDLEWARE: VERIFICAR TOKEN
    verificarToken: (requisicao, resposta, next) => {
        // Pega o token do cabeçalho
        const token = requisicao.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return resposta.status(401).json({ 
                erro: 'Acesso negado. Faça login.' 
            });
        }
        
        try {
            // Decodifica o token
            const decodificado = jwt.verify(token, SEGREDO_JWT);
            requisicao.cliente = decodificado; // Adiciona dados do cliente na requisição
            next(); // Continua para a rota
        } catch (erro) {
            return resposta.status(401).json({ 
                erro: 'Token inválido ou expirado. Faça login novamente.' 
            });
        }
    }
};

module.exports = auth;