const request = require('supertest');
const app = require('../app');

describe('Podstawowe testy autoryzacji', () => {
  test('Rejestracja nowego użytkownika → 201', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'auth_test_user',
        email: 'auth_test_user@test.com',
        password: 'authpass123',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
  });

  test('Logowanie zwraca token', async () => {
    // upewnij się, że użytkownik istnieje
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'auth_login_user',
        email: 'auth_login_user@test.com',
        password: 'loginpass123',
      });

    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: 'auth_login_user',
        password: 'loginpass123',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
