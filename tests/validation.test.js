const { errorResponse } = require('../utils/validation');

test('Tworzy poprawny obiekt błędu', () => {
  const err = errorResponse(
    400,
    [{ field: 'email', message: 'Niepoprawny email' }]
  );

  expect(err.status).toBe(400);
  expect(Array.isArray(err.fieldErrors)).toBe(true);
  expect(err.fieldErrors[0].field).toBe('email');
});
