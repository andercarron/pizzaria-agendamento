const dashboardModel = require('../models/dashboardModel');

const dashboardController = {
    
    resumo: async (requisicao, resposta) => {
        try {
            const dados = await dashboardModel.resumo();
            resposta.json(dados);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },
    
    produtosMaisVendidos: async (requisicao, resposta) => {
        try {
            const dados = await dashboardModel.produtosMaisVendidos();
            resposta.json(dados);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },
    
    horariosPico: async (requisicao, resposta) => {
        try {
            const dados = await dashboardModel.horariosPico();
            resposta.json(dados);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },
    
    clientesFieis: async (requisicao, resposta) => {
        try {
            const dados = await dashboardModel.clientesFieis();
            resposta.json(dados);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },
    
    vendasPorDia: async (requisicao, resposta) => {
        try {
            const dias = requisicao.query.dias || 7;
            const dados = await dashboardModel.vendasPorDia(dias);
            resposta.json(dados);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    }
};

module.exports = dashboardController;