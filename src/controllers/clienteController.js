const clienteModel = require('../models/clienteModel');
const logger = require('../utils/logger');

const clienteController = {
    
    criar: async (requisicao, resposta) => {
        try {
            const { nome, telefone } = requisicao.body;
            
            const existente = await clienteModel.buscarPorTelefone(telefone);
            if (existente) {
                return resposta.status(200).json(existente);
            }
            
            logger.info(`Criando cliente: ${nome}`);
            const novoCliente = await clienteModel.criar(nome, telefone);
            logger.info(`Cliente criado: ID ${novoCliente.id}`);
            resposta.status(201).json(novoCliente);
            
        } catch (erro) {
            logger.erro('Falha ao criar cliente', erro);
            resposta.status(500).json({ erro: 'Erro interno do servidor' });
        }
    },

    listar: async (requisicao, resposta) => {
        try {
            logger.info('Listando clientes');
            const clientes = await clienteModel.listar();
            resposta.json(clientes);
        } catch (erro) {
            logger.erro('Falha ao listar clientes', erro);
            resposta.status(500).json({ erro: 'Erro interno do servidor' });
        }
    },

    deletar: async (requisicao, resposta) => {
        try {
            const { id } = requisicao.params;
            logger.info(`Deletando cliente ID ${id}`);
            const resultado = await clienteModel.deletar(id);
            logger.info(`Cliente ID ${id} deletado`);
            resposta.json(resultado);
        } catch (erro) {
            logger.erro(`Falha ao deletar cliente ID ${requisicao.params.id}`, erro);
            resposta.status(500).json({ erro: 'Erro interno do servidor' });
        }
    },

    listarAdmin: async (requisicao, resposta) => {
        try {
            const { busca } = requisicao.query;
            const clientes = await clienteModel.listarAdmin(busca);
            resposta.json(clientes);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },

    editarAdmin: async (requisicao, resposta) => {
        try {
            const { id } = requisicao.params;
            const { nome, telefone, tipo } = requisicao.body;
            const cliente = await clienteModel.editarAdmin(id, nome, telefone, tipo);
            resposta.json(cliente);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },

    deletarAdmin: async (requisicao, resposta) => {
        try {
            const { id } = requisicao.params;
            await clienteModel.deletarAdmin(id);
            resposta.json({ mensagem: 'Cliente e seus pedidos foram excluídos' });
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    }
};

module.exports = clienteController;