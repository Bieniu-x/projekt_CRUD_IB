const request = require('supertest');
const app = require('../app');

describe('Prosta integracja API', () => {
  test('Rejestracja – błędny email → 400', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'invalid_email_user',
        email: 'wrongemail', // zły format
        password: 'validpass123',
      });

    expect(res.status).toBe(400);
  });

  test('GET nieistniejącej gry → 404 lub 401', async () => {
    const res = await request(app).get('/api/games/999999');

    expect([401, 404]).toContain(res.status);
  });
});
