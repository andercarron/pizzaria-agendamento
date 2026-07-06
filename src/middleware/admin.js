const admin = {
    verificarAdmin: (requisicao, resposta, next) => {
        // O middleware auth.verificarToken já rodou antes
        // e salvou os dados em requisicao.cliente
        
        if (requisicao.cliente.tipo !== 'admin') {
            return resposta.status(403).json({
                erro: 'Acesso negado. Apenas administradores.'
            });
        }
        
        next(); // É admin, pode continuar
    }
};

module.exports = admin;