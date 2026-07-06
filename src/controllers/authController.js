const authModel = require('../models/authModel');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const authController = {
    
    // CADASTRO
    cadastrar: async (requisicao, resposta) => {
        try {
            const { nome, email, telefone, senha } = requisicao.body;
            
            if (!nome || !email || !telefone || !senha) {
                return resposta.status(400).json({ erro: 'Todos os campos são obrigatórios' });
            }
            
            if (senha.length < 6) {
                return resposta.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
            }
            
            const existente = await authModel.buscarPorEmail(email);
            if (existente) {
                return resposta.status(409).json({ erro: 'Este email já está cadastrado' });
            }
            
            const novoCliente = await authModel.cadastrar(nome, email, telefone, senha);
            const token = auth.gerarToken(novoCliente);
            
            logger.info(`Novo cadastro: ${email}`);
            resposta.status(201).json({
                mensagem: 'Cadastro realizado com sucesso!',
                cliente: novoCliente,
                token
            });
            
        } catch (erro) {
            logger.erro('Erro no cadastro', erro);
            resposta.status(500).json({ erro: 'Erro interno do servidor' });
        }
    },
    
    // LOGIN
    login: async (requisicao, resposta) => {
        try {
            const { email, senha } = requisicao.body;
            
            if (!email || !senha) {
                return resposta.status(400).json({ erro: 'Email e senha são obrigatórios' });
            }
            
            const cliente = await authModel.buscarPorEmail(email);
            if (!cliente) {
                return resposta.status(401).json({ erro: 'Email ou senha incorretos' });
            }
            
            const senhaValida = await authModel.verificarSenha(senha, cliente.senha);
            if (!senhaValida) {
                return resposta.status(401).json({ erro: 'Email ou senha incorretos' });
            }
            
            const token = auth.gerarToken(cliente);
            
            logger.info(`Login: ${email}`);
            resposta.json({
                mensagem: 'Login realizado com sucesso!',
                cliente: {
                    id: cliente.id,
                    nome: cliente.nome,
                    email: cliente.email,
                    telefone: cliente.telefone,
                    tipo: cliente.tipo
                },
                token
            });
            
        } catch (erro) {
            logger.erro('Erro no login', erro);
            resposta.status(500).json({ erro: 'Erro interno do servidor' });
        }
    },

    // EXCLUIR PRÓPRIA CONTA
    excluirConta: async (requisicao, resposta) => {
        try {
            const { senha } = requisicao.body;
            const clienteId = requisicao.cliente.id;

            const cliente = await authModel.buscarPorId(clienteId);
            
            if (!cliente) {
                return resposta.status(404).json({ erro: 'Cliente não encontrado' });
            }

            const senhaValida = await authModel.verificarSenha(senha, cliente.senha);
            if (!senhaValida) {
                return resposta.status(401).json({ erro: 'Senha incorreta' });
            }

            await authModel.deletarConta(clienteId);
            
            logger.info(`Conta excluída: ${cliente.email}`);
            resposta.json({ mensagem: 'Conta excluída com sucesso' });

        } catch (erro) {
            logger.erro('Erro ao excluir conta', erro);
            resposta.status(500).json({ erro: erro.message });
        }
    }
};

module.exports = authController;