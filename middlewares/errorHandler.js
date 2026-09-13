function errorHandler(err, req, res, next) {
  console.error('Error capturado:', err);

  const status = err.status || 500;
  const message = status === 500
    ? 'Ocurrió un error interno en el servidor'
    : err.message;

  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;