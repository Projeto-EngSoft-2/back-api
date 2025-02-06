const request = require('supertest');
const app = require('../api/server');

describe('POST /logar', () => {
  it('Deve retornar um token JWT para usuário válido', async () => {
    const response = await request(app).post('/logar').send({
      email: 'teste@teste.com',
      senha: '123456'
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('Deve retornar erro para credenciais inválidas', async () => {
    const response = await request(app).post('/logar').send({
      email: 'erro@erro.com',
      senha: 'errado'
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciais inválidas.');
  });
});
