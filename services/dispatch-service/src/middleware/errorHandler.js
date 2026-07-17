function errorHandler(err, req, res, _next) {
  console.error(`[${req.method} ${req.path}]`, err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

module.exports = errorHandler;
