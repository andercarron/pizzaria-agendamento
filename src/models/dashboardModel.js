const conexao = require('../database/database');

const dashboardModel = {
    
    resumo: async () => {
        // Total de pedidos hoje
        const hoje = await conexao.query(
            "SELECT COUNT(*) as total FROM pedidos WHERE criado_em::date = CURRENT_DATE"
        );
        
        // Pedidos por status
        const porStatus = await conexao.query(
            "SELECT status, COUNT(*) as total FROM pedidos GROUP BY status"
        );
        
        // Faturamento (retirados = concluídos)
        const faturamento = await conexao.query(
            "SELECT COALESCE(SUM(quantidade * preco), 0) as total FROM pedidos WHERE status = 'retirado'"
        );
        
        // Perda com cancelados
        const perda = await conexao.query(
            "SELECT COALESCE(SUM(quantidade * preco), 0) as total FROM pedidos WHERE status = 'cancelado'"
        );
        
        // Ticket médio
        const ticketMedio = await conexao.query(
            "SELECT COALESCE(AVG(quantidade * preco), 0) as media FROM pedidos WHERE status = 'retirado'"
        );
        
        return {
            hoje: parseInt(hoje.rows[0].total),
            porStatus: porStatus.rows,
            faturamento: parseFloat(faturamento.rows[0].total),
            perda: parseFloat(perda.rows[0].total),
            ticketMedio: parseFloat(ticketMedio.rows[0].media)
        };
    },
    
    produtosMaisVendidos: async () => {
        const resultado = await conexao.query(
            `SELECT sabor, SUM(quantidade) as total_vendido, SUM(quantidade * preco) as receita
             FROM pedidos WHERE status = 'retirado'
             GROUP BY sabor ORDER BY total_vendido DESC`
        );
        return resultado.rows;
    },
    
    horariosPico: async () => {
        const resultado = await conexao.query(
            `SELECT horario_retirada, COUNT(*) as total
             FROM pedidos
             GROUP BY horario_retirada ORDER BY total DESC LIMIT 5`
        );
        return resultado.rows;
    },
    
    clientesFieis: async () => {
        const resultado = await conexao.query(
            `SELECT c.nome, c.email, COUNT(p.id) as total_pedidos, SUM(p.quantidade * p.preco) as total_gasto
             FROM pedidos p
             JOIN clientes c ON p.cliente_id = c.id
             WHERE p.status = 'retirado'
             GROUP BY c.id, c.nome, c.email
             ORDER BY total_pedidos DESC LIMIT 5`
        );
        return resultado.rows;
    },
    
    vendasPorDia: async (dias = 7) => {
        const resultado = await conexao.query(
            `SELECT criado_em::date as data, COUNT(*) as total_pedidos, SUM(quantidade * preco) as receita
             FROM pedidos WHERE status = 'retirado'
             AND criado_em >= CURRENT_DATE - $1
             GROUP BY criado_em::date ORDER BY data DESC`,
            [dias]
        );
        return resultado.rows;
    }
};

module.exports = dashboardModel;