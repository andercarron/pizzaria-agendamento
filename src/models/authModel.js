const conexao = require('../database/database');
const bcrypt = require('bcryptjs');

const authModel = {
    
    // CADASTRAR NOVO USUÁRIO
    cadastrar: async (nome, email, telefone, senha) => {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        
        const resultado = await conexao.query(
            `INSERT INTO clientes (nome, email, telefone, senha) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, nome, email, telefone, criado_em`,
            [nome, email, telefone, senhaHash]
        );
        return resultado.rows[0];
    },
    
    // BUSCAR POR EMAIL (para login)
    buscarPorEmail: async (email) => {
        const resultado = await conexao.query(
            'SELECT * FROM clientes WHERE email = $1',
            [email]
        );
        return resultado.rows[0];
    },

    // BUSCAR POR ID (para exclusão de conta)
    buscarPorId: async (id) => {
        const resultado = await conexao.query(
            'SELECT * FROM clientes WHERE id = $1',
            [id]
        );
        return resultado.rows[0];
    },
    
    // VERIFICAR SENHA
    verificarSenha: async (senhaDigitada, senhaHash) => {
        return await bcrypt.compare(senhaDigitada, senhaHash);
    },

    // DELETAR CONTA E PEDIDOS
    deletarConta: async (id) => {
        await conexao.query('DELETE FROM pedidos WHERE cliente_id = $1', [id]);
        await conexao.query('DELETE FROM clientes WHERE id = $1', [id]);
        return { mensagem: 'Conta excluída com sucesso' };
    }
};

module.exports = authModel;