const conexao = require('../database/database');

const clienteModel = {
    
    criar: async (nome, telefone) => {
        const resultado = await conexao.query(
            'INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING *',
            [nome, telefone]
        );
        return resultado.rows[0];
    },

    listar: async () => {
        const resultado = await conexao.query('SELECT * FROM clientes ORDER BY id');
        return resultado.rows;
    },

    deletar: async (id) => {
        await conexao.query('DELETE FROM clientes WHERE id = $1', [id]);
        return { mensagem: 'Cliente deletado com sucesso' };
    },

    buscarPorTelefone: async (telefone) => {
        const resultado = await conexao.query(
            'SELECT * FROM clientes WHERE telefone = $1',
            [telefone]
        );
        return resultado.rows[0];
    },

    listarAdmin: async (busca) => {
        let sql = 'SELECT id, nome, email, telefone, tipo, criado_em FROM clientes WHERE 1=1';
        const params = [];
        
        if (busca) {
            sql += ' AND (nome ILIKE $1 OR email ILIKE $1)';
            params.push(`%${busca}%`);
        }
        
        sql += ' ORDER BY id';
        const resultado = await conexao.query(sql, params);
        return resultado.rows;
    },

    editarAdmin: async (id, nome, telefone, tipo) => {
        const resultado = await conexao.query(
            'UPDATE clientes SET nome = $1, telefone = $2, tipo = $3 WHERE id = $4 RETURNING id, nome, email, telefone, tipo',
            [nome, telefone, tipo, id]
        );
        return resultado.rows[0];
    },

    deletarAdmin: async (id) => {
        await conexao.query('DELETE FROM pedidos WHERE cliente_id = $1', [id]);
        await conexao.query('DELETE FROM clientes WHERE id = $1', [id]);
        return { mensagem: 'Cliente e seus pedidos foram excluídos' };
    }
};

module.exports = clienteModel;