const request = require('supertest');
const express = require('express');
const pedidoController = require('../src/controllers/pedidoController');

jest.mock('../src/models/pedidoModel');
const pedidoModel = require('../src/models/pedidoModel');

const app = express();
app.use(express.json());
app.post('/pedidos', pedidoController.criar);
app.get('/pedidos', pedidoController.listar);
app.patch('/pedidos/:id/cancelar', pedidoController.cancelar);

describe('Testes do Controller de Pedidos', () => {
    
    test('Deve criar um pedido com sucesso', async () => {
        pedidoModel.criar.mockResolvedValue({
            id: 1,
            cliente_id: 1,
            sabor: 'Calabresa',
            tamanho: 'Grande',
            horario_retirada: '20:00',
            status: 'pendente'
        });

        const resposta = await request(app)
            .post('/pedidos')
            .send({
                cliente_id: 1,
                sabor: 'Calabresa',
                tamanho: 'Grande',
                horario_retirada: '20:00'
            });

        expect(resposta.status).toBe(201);
        expect(resposta.body.sabor).toBe('Calabresa');
        expect(resposta.body.status).toBe('pendente');
    });

    test('Deve listar pedidos', async () => {
        pedidoModel.listar.mockResolvedValue([
            { id: 1, nome: 'João', sabor: 'Calabresa', status: 'pendente' }
        ]);

        const resposta = await request(app).get('/pedidos');

        expect(resposta.status).toBe(200);
        expect(resposta.body.length).toBe(1);
    });

    test('Deve cancelar um pedido', async () => {
        pedidoModel.cancelar.mockResolvedValue({
            id: 1,
            status: 'cancelado'
        });

        const resposta = await request(app).patch('/pedidos/1/cancelar');

        expect(resposta.status).toBe(200);
        expect(resposta.body.mensagem).toBe('Pedido cancelado');
    });

    test('Deve retornar erro 500 quando criar pedido falhar', async () => {
        pedidoModel.criar.mockRejectedValue(new Error('Banco fora do ar'));

        const resposta = await request(app)
            .post('/pedidos')
            .send({
                cliente_id: 1,
                sabor: 'Calabresa',
                tamanho: 'Grande',
                horario_retirada: '20:00'
            });

        expect(resposta.status).toBe(500);
        expect(resposta.body.erro).toBe('Banco fora do ar');
    });

    test('Deve retornar erro 500 quando listar pedidos falhar', async () => {
        pedidoModel.listar.mockRejectedValue(new Error('Timeout'));

        const resposta = await request(app).get('/pedidos');

        expect(resposta.status).toBe(500);
        expect(resposta.body.erro).toBe('Timeout');
    });

    test('Deve retornar erro 500 quando cancelar pedido falhar', async () => {
        pedidoModel.cancelar.mockRejectedValue(new Error('Pedido não encontrado'));

        const resposta = await request(app).patch('/pedidos/999/cancelar');

        expect(resposta.status).toBe(500);
        expect(resposta.body.erro).toBe('Pedido não encontrado');
    });
});