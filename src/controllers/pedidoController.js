const pedidoModel = require('../models/pedidoModel');
const logger = require('../utils/logger');

const pedidoController = {
    
    criar: async (requisicao, resposta) => {
        try {
            const { cliente_id, sabor, tamanho, horario_retirada, quantidade, preco } = requisicao.body;
            
            logger.info(`Criando pedido: ${quantidade || 1}x ${sabor} ${tamanho}`);
            
            const novoPedido = await pedidoModel.criar(
                cliente_id, sabor, tamanho, horario_retirada, quantidade || 1, preco || 0
            );
            
            logger.info(`Pedido criado: ID ${novoPedido.id}`);
            resposta.status(201).json(novoPedido);
            
        } catch (erro) {
            logger.erro('Falha ao criar pedido', erro);
            resposta.status(500).json({ erro: erro.message });
        }
    },

    listar: async (requisicao, resposta) => {
        try {
            logger.info('Listando pedidos');
            
            let pedidos;
            
            if (requisicao.cliente.tipo === 'admin') {
                pedidos = await pedidoModel.listar();
            } else {
                pedidos = await pedidoModel.listarPorCliente(requisicao.cliente.id);
            }
            
            resposta.json(pedidos);
            
        } catch (erro) {
            logger.erro('Falha ao listar pedidos', erro);
            resposta.status(500).json({ erro: erro.message });
        }
    },

    listarAdmin: async (requisicao, resposta) => {
        try {
            const { cliente, sabor, status, dataInicio, dataFim } = requisicao.query;
            const pedidos = await pedidoModel.listarComFiltros({ cliente, sabor, status, dataInicio, dataFim });
            resposta.json(pedidos);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },

    cancelar: async (requisicao, resposta) => {
        try {
            const { id } = requisicao.params;
            
            logger.info(`Cancelando pedido ID ${id}`);
            
            const pedidoCancelado = await pedidoModel.cancelar(id);
            
            logger.info(`Pedido ID ${id} cancelado`);
            resposta.json({ mensagem: 'Pedido cancelado', pedido: pedidoCancelado });
            
        } catch (erro) {
            logger.erro(`Falha ao cancelar pedido ID ${requisicao.params.id}`, erro);
            resposta.status(500).json({ erro: erro.message });
        }
    },

    atualizarStatus: async (requisicao, resposta) => {
        try {
            const { id } = requisicao.params;
            const { status } = requisicao.body;
            
            const statusPermitidos = ['pronto', 'retirado', 'cancelado'];
            
            if (!statusPermitidos.includes(status)) {
                return resposta.status(400).json({
                    erro: 'Status inválido. Permitidos: pronto, retirado, cancelado'
                });
            }
            
            logger.info(`Atualizando pedido ID ${id} para status: ${status}`);
            
            const pedidoAtualizado = await pedidoModel.atualizarStatus(id, status);
            
            logger.info(`Pedido ID ${id} atualizado para: ${status}`);
            resposta.json({ mensagem: 'Status atualizado', pedido: pedidoAtualizado });
            
        } catch (erro) {
            logger.erro('Falha ao atualizar status', erro);
            resposta.status(500).json({ erro: erro.message });
        }
    }
};

module.exports = pedidoController;