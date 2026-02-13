const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    error: "Error interno del servidor",
  });
};

export default errorHandler;
