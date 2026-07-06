const conexao = require('../database/database');

const pedidoModel = {
    
    criar: async (cliente_id, sabor, tamanho, horario_retirada, quantidade = 1, preco = 0) => {
        const resultado = await conexao.query(
            `INSERT INTO pedidos (cliente_id, sabor, tamanho, horario_retirada, quantidade, preco) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [cliente_id, sabor, tamanho, horario_retirada, quantidade, preco]
        );
        return resultado.rows[0];
    },

    listar: async () => {
        const resultado = await conexao.query(
            `SELECT p.id, c.nome, c.telefone, p.sabor, p.tamanho, 
                    p.horario_retirada, p.status, p.quantidade, p.preco, p.criado_em
             FROM pedidos p
             JOIN clientes c ON p.cliente_id = c.id
             ORDER BY p.criado_em DESC
             LIMIT 7`
        );
        return resultado.rows;
    },

    listarPorCliente: async (cliente_id) => {
        const resultado = await conexao.query(
            `SELECT p.id, c.nome, c.telefone, p.sabor, p.tamanho, 
                    p.horario_retirada, p.status, p.quantidade, p.preco, p.criado_em
             FROM pedidos p
             JOIN clientes c ON p.cliente_id = c.id
             WHERE p.cliente_id = $1
             ORDER BY p.criado_em DESC
             LIMIT 7`,
            [cliente_id]
        );
        return resultado.rows;
    },

    listarComFiltros: async (filtros) => {
    let sql = `SELECT p.id, c.nome, c.telefone, p.sabor, p.tamanho, p.quantidade, p.preco,
                      p.horario_retirada, p.status, p.criado_em, p.atualizado_em
               FROM pedidos p
               JOIN clientes c ON p.cliente_id = c.id
               WHERE 1=1`;
        const params = [];
        let i = 1;

        if (filtros.cliente) {
            sql += ` AND c.nome ILIKE $${i}`;
            params.push(`%${filtros.cliente}%`);
            i++;
        }
        if (filtros.sabor) {
            sql += ` AND p.sabor ILIKE $${i}`;
            params.push(`%${filtros.sabor}%`);
            i++;
        }
        if (filtros.status) {
            sql += ` AND p.status = $${i}`;
            params.push(filtros.status);
            i++;
        }
        if (filtros.dataInicio) {
            sql += ` AND p.criado_em >= $${i}`;
            params.push(filtros.dataInicio);
            i++;
        }
        if (filtros.dataFim) {
            sql += ` AND p.criado_em <= $${i}::date + interval '1 day'`;
            params.push(filtros.dataFim);
            i++;
        }

        sql += ' ORDER BY p.criado_em DESC LIMIT 50';
        
        const resultado = await conexao.query(sql, params);
        return resultado.rows;
    },

    cancelar: async (id) => {
    const resultado = await conexao.query(
        "UPDATE pedidos SET status = 'cancelado', atualizado_em = NOW() WHERE id = $1 RETURNING *",
        [id]
    );
    return resultado.rows[0];
},

   atualizarStatus: async (id, status) => {
    const resultado = await conexao.query(
        "UPDATE pedidos SET status = $1, atualizado_em = NOW() WHERE id = $2 RETURNING *",
        [status, id]
    );
    return resultado.rows[0];
}
};

module.exports = pedidoModel;