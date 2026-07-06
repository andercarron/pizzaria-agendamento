const express = require('express');
const conexao = require('./src/database/database');
const clienteController = require('./src/controllers/clienteController');
const pedidoController = require('./src/controllers/pedidoController');
const morgan = require('morgan');
const logger = require('./src/utils/logger');
const authController = require('./src/controllers/authController');
const auth = require('./src/middleware/auth');
const admin = require('./src/middleware/admin');
const produtoController = require('./src/controllers/produtoController');
const dashboardController = require('./src/controllers/dashboardController');

const app = express();
const PORTA = 3000;

// Dashboard (admin)
app.get('/admin/dashboard/resumo', auth.verificarToken, admin.verificarAdmin, dashboardController.resumo);
app.get('/admin/dashboard/produtos', auth.verificarToken, admin.verificarAdmin, dashboardController.produtosMaisVendidos);
app.get('/admin/dashboard/horarios', auth.verificarToken, admin.verificarAdmin, dashboardController.horariosPico);
app.get('/admin/dashboard/clientes', auth.verificarToken, admin.verificarAdmin, dashboardController.clientesFieis);



// ═══════════ MIDDLEWARES (PRECISAM VIR PRIMEIRO!) ═══════════
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('dev'));

app.use((requisicao, resposta, next) => {
    logger.info(`${requisicao.method} ${requisicao.url}`);
    next();
});

// ═══════════ ROTA RAIZ ═══════════
app.get('/', (requisicao, resposta) => {
    resposta.send('🍕 Pizzaria aberta! Nosso servidor está funcionando.');
});

// ═══════════ ROTAS PÚBLICAS ═══════════
app.get('/produtos', produtoController.listar);
app.post('/auth/cadastrar', authController.cadastrar);
app.post('/auth/login', authController.login);

// ═══════════ ROTAS PROTEGIDAS ═══════════
app.post('/clientes', auth.verificarToken, clienteController.criar);
app.get('/clientes', auth.verificarToken, clienteController.listar);
app.delete('/clientes/:id', auth.verificarToken, clienteController.deletar);
app.delete('/auth/conta', auth.verificarToken, authController.excluirConta);
// Rotas de produtos (admin)
app.get('/admin/produtos', auth.verificarToken, admin.verificarAdmin, produtoController.listarTodos);
app.post('/admin/produtos', auth.verificarToken, admin.verificarAdmin, produtoController.criar);
app.put('/admin/produtos/:id', auth.verificarToken, admin.verificarAdmin, produtoController.editar);
app.delete('/admin/produtos/:id', auth.verificarToken, admin.verificarAdmin, produtoController.deletar);

// Admin - Pedidos com filtros
app.get('/admin/pedidos', auth.verificarToken, admin.verificarAdmin, pedidoController.listarAdmin);

// Admin - Clientes
app.get('/admin/clientes', auth.verificarToken, admin.verificarAdmin, clienteController.listarAdmin);
app.put('/admin/clientes/:id', auth.verificarToken, admin.verificarAdmin, clienteController.editarAdmin);
app.delete('/admin/clientes/:id', auth.verificarToken, admin.verificarAdmin, clienteController.deletarAdmin);


app.post('/pedidos', auth.verificarToken, pedidoController.criar);
app.get('/pedidos', auth.verificarToken, pedidoController.listar);
app.patch('/pedidos/:id/cancelar', auth.verificarToken, pedidoController.cancelar);
app.patch('/admin/pedidos/:id/status', auth.verificarToken, admin.verificarAdmin, pedidoController.atualizarStatus);


// ═══════════ MIDDLEWARE DE ERRO ═══════════
app.use((erro, requisicao, resposta, next) => {
    logger.erro('Erro não tratado', erro);
    resposta.status(500).json({ 
        erro: 'Erro interno do servidor',
        mensagem: erro.message 
    });
});

// ═══════════ INICIAR ═══════════
app.listen(PORTA, async () => {
    try {
        await conexao.query('SELECT 1');
        console.log('✅ Conectado ao PostgreSQL!');
    } catch (erro) {
        console.error('❌ Erro ao conectar ao banco:', erro.message);
    }
    console.log(`Servidor rodando na porta ${PORTA}. Acesse: http://localhost:${PORTA}`);
});