const produtoModel = require('../models/produtoModel');
const logger = require('../utils/logger');

const produtoController = {
    
    listar: async (requisicao, resposta) => {
        try {
            const produtos = await produtoModel.listar();
            resposta.json(produtos);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },

    listarTodos: async (requisicao, resposta) => {
        try {
            const produtos = await produtoModel.listarTodos();
            resposta.json(produtos);
        } catch (erro) {
            resposta.status(500).json({ erro: erro.message });
        }
    },

    criar: async (requisicao, resposta) => {
        try {
            const { nome, descricao, preco, tamanho } = requisicao.body;
            
            if (!nome || !preco || !tamanho) {
                return resposta.status(400).json({ erro: 'Nome, preço e tamanho são obrigatórios' });
            }

            const novoProduto = await produtoModel.criar(nome, descricao, preco, tamanho);
            logger.info(`Produto criado: ${nome}`);
            resposta.status(201).json(novoProduto);
        } catch (erro) {
            logger.erro('Erro ao criar produto', erro);
            resposta.status(500).json({ erro: erro.message });
        }
    },

    editar: async (requisicao, resposta) => {
        try {
            const { id } = requisicao.params;
            const { nome, descricao, preco, tamanho, disponivel } = requisicao.body;
            
            const produtoAtualizado = await produtoModel.editar(id, nome, descricao, preco, tamanho, disponivel);
            logger.info(`Produto atualizado: ID ${id}`);
            resposta.json(produtoAtualizado);
        } catch (erro) {
            logger.erro('Erro ao editar produto', erro);
            resposta.status(500).json({ erro: erro.message });
        }
    },

    deletar: async (requisicao, resposta) => {
        try {
            const { id } = requisicao.params;
            await produtoModel.deletar(id);
            logger.info(`Produto deletado: ID ${id}`);
            resposta.json({ mensagem: 'Produto deletado com sucesso' });
        } catch (erro) {
            logger.erro('Erro ao deletar produto', erro);
            resposta.status(500).json({ erro: erro.message });
        }
    }
};

module.exports = produtoController;