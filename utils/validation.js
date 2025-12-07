function errorResponse(status, fieldErrors = [], message) {
  const finalMessage =
    message ||
    (Array.isArray(fieldErrors) && fieldErrors[0] && fieldErrors[0].message) ||
    '';

  return {
    status,
    fieldErrors,   
    message: finalMessage,
  };
}

module.exports = { errorResponse };
