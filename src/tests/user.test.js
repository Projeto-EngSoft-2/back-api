const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Usuario = require('../models/User');

afterAll(async () => {
  await mongoose.connection.close(); 
});

afterEach(async () => {
  await Usuario.deleteMany({ email: /teste1@teste.com$/ });
});

describe('POST /create/user', () => {
  it('Deve registrar um novo usuário com sucesso', async () => {
    const response = await request(app).post('/create/user').send({
      nome: 'Usuário Teste1',
      email: 'teste1@teste.com',
      senha: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body.mensagem).toBe('Usuário registrado com sucesso!');
  });

  it('Deve retornar erro ao tentar registrar um usuário com e-mail já existente', async () => {
    await Usuario.create({
      nome: 'Usuário Teste',
      email: 'teste1@teste.com',
      senha: 'senhaSegura',
    });

    const response = await request(app).post('/create/user').send({
      nome: 'Usuário Teste',
      email: 'teste1@teste.com',
      senha: 'novaSenha',
    });

    expect(response.status).toBe(400);
    expect(response.body.mensagem).toBe('O e-mail já está em uso.');
  });

  it('Deve retornar erro ao enviar dados incompletos', async () => {
    const response = await request(app).post('/create/user').send({
      nome: 'Usuário Incompleto',
    });

    expect(response.status).toBe(400);
    expect(response.body.mensagem).toBe('Todos os campos são obrigatórios.');
  });
});
