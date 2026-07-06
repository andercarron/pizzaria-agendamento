// ═══════════════════════════════════════════
// IMPORTAÇÕES
// ═══════════════════════════════════════════
const request = require('supertest');
const express = require('express');
const clienteController = require('../src/controllers/clienteController');

// ═══════════════════════════════════════════
// MOCK DO MODEL
// ═══════════════════════════════════════════
// Substitui o model real por um falso (sem banco de dados)
jest.mock('../src/models/clienteModel');

// Importa o model mockado para podermos controlar suas respostas
const clienteModel = require('../src/models/clienteModel');

// ═══════════════════════════════════════════
// CONFIGURAÇÃO DO APP DE TESTE
// ═══════════════════════════════════════════
const app = express();
app.use(express.json());
app.post('/clientes', clienteController.criar);
app.get('/clientes', clienteController.listar);
app.delete('/clientes/:id', clienteController.deletar);

// ═══════════════════════════════════════════
// BATERIA DE TESTES
// ═══════════════════════════════════════════
describe('Testes do Controller de Clientes', () => {

    // ─── TESTE 1: CRIAR CLIENTE COM SUCESSO ───
    test('Deve criar um cliente e retornar status 201', async () => {
        
        // ARRANGE (Preparar): definimos o que o mock deve responder
        clienteModel.criar.mockResolvedValue({
            id: 1,
            nome: 'João Silva',
            telefone: '11999998888'
        });

        // ACT (Agir): simulamos uma requisição POST
        const resposta = await request(app)
            .post('/clientes')
            .send({
                nome: 'João Silva',
                telefone: '11999998888'
            });

        // ASSERT (Verificar): conferimos se a resposta está correta
        expect(resposta.status).toBe(201);
        expect(resposta.body.id).toBe(1);
        expect(resposta.body.nome).toBe('João Silva');
        expect(resposta.body.telefone).toBe('11999998888');
    });

    // ─── TESTE 2: LISTAR CLIENTES ───
    test('Deve listar todos os clientes e retornar status 200', async () => {
        
        // ARRANGE: mock retorna um array com 2 clientes
        clienteModel.listar.mockResolvedValue([
            { id: 1, nome: 'João Silva', telefone: '11999998888' },
            { id: 2, nome: 'Maria Souza', telefone: '11977776666' }
        ]);

        // ACT: simulamos uma requisição GET
        const resposta = await request(app).get('/clientes');

        // ASSERT
        expect(resposta.status).toBe(200);
        expect(resposta.body.length).toBe(2);
        expect(resposta.body[0].nome).toBe('João Silva');
        expect(resposta.body[1].nome).toBe('Maria Souza');
    });

    // ─── TESTE 3: LISTAR CLIENTES VAZIO ───
    test('Deve retornar array vazio quando não houver clientes', async () => {
        
        // ARRANGE: mock retorna array vazio
        clienteModel.listar.mockResolvedValue([]);

        // ACT
        const resposta = await request(app).get('/clientes');

        // ASSERT
        expect(resposta.status).toBe(200);
        expect(resposta.body.length).toBe(0);
        expect(resposta.body).toEqual([]);
    });

    // ─── TESTE 4: DELETAR CLIENTE ───
    test('Deve deletar um cliente e retornar mensagem de sucesso', async () => {
        
        // ARRANGE: mock retorna mensagem de sucesso
        clienteModel.deletar.mockResolvedValue({
            mensagem: 'Cliente deletado com sucesso'
        });

        // ACT: DELETE /clientes/1
        const resposta = await request(app).delete('/clientes/1');

        // ASSERT
        expect(resposta.status).toBe(200);
        expect(resposta.body.mensagem).toBe('Cliente deletado com sucesso');
    });

    // ─── TESTE 5: ERRO AO CRIAR CLIENTE ───
    test('Deve retornar erro 500 quando criar cliente falhar', async () => {
        
        // ARRANGE: mock simula uma falha
        clienteModel.criar.mockRejectedValue(new Error('Nome é obrigatório'));

        // ACT
        const resposta = await request(app)
            .post('/clientes')
            .send({
                nome: '',
                telefone: '11999998888'
            });

        // ASSERT
        expect(resposta.status).toBe(500);
        expect(resposta.body.erro).toBe('Nome é obrigatório');
    });

    // ─── TESTE 6: ERRO AO LISTAR CLIENTES ───
    test('Deve retornar erro 500 quando listar clientes falhar', async () => {
        
        // ARRANGE: mock simula falha de conexão
        clienteModel.listar.mockRejectedValue(new Error('Falha na conexão com o banco'));

        // ACT
        const resposta = await request(app).get('/clientes');

        // ASSERT
        expect(resposta.status).toBe(500);
        expect(resposta.body.erro).toBe('Falha na conexão com o banco');
    });

    // ─── TESTE 7: ERRO AO DELETAR CLIENTE ───
    test('Deve retornar erro 500 quando deletar cliente falhar', async () => {
        
        // ARRANGE: mock simula que o cliente não existe
        clienteModel.deletar.mockRejectedValue(new Error('Cliente não encontrado'));

        // ACT: tenta deletar id 999 (não existe)
        const resposta = await request(app).delete('/clientes/999');

        // ASSERT
        expect(resposta.status).toBe(500);
        expect(resposta.body.erro).toBe('Cliente não encontrado');
    });
});