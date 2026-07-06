const conexao = require('../database/database');

const produtoModel = {
    
    listar: async () => {
        const resultado = await conexao.query(
            'SELECT * FROM produtos WHERE disponivel = true ORDER BY nome'
        );
        return resultado.rows;
    },

    listarTodos: async () => {
        const resultado = await conexao.query(
            'SELECT * FROM produtos ORDER BY nome'
        );
        return resultado.rows;
    },

    criar: async (nome, descricao, preco, tamanho) => {
        const resultado = await conexao.query(
            `INSERT INTO produtos (nome, descricao, preco, tamanho) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [nome, descricao, preco, tamanho]
        );
        return resultado.rows[0];
    },

    editar: async (id, nome, descricao, preco, tamanho, disponivel) => {
        const resultado = await conexao.query(
            `UPDATE produtos 
             SET nome = $1, descricao = $2, preco = $3, tamanho = $4, disponivel = $5
             WHERE id = $6 RETURNING *`,
            [nome, descricao, preco, tamanho, disponivel, id]
        );
        return resultado.rows[0];
    },

    deletar: async (id) => {
        await conexao.query('DELETE FROM produtos WHERE id = $1', [id]);
        return { mensagem: 'Produto deletado com sucesso' };
    }
};

module.exports = produtoModel;