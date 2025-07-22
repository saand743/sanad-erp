const request = require('supertest');
const app = require('../app'); // تأكد من أن مسار تطبيقك صحيح.

test('GET /api/products should return products', async () => {
  const response = await request(app).get('/api/products');
  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
});
