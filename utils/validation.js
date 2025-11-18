// utils/validation.js
function errorResponse(status, errors = [], message) {
  return {
    status,
    errors,
    message: message || (errors[0] && errors[0].message) || 'Błąd walidacji',
  };
}

module.exports = { errorResponse };
