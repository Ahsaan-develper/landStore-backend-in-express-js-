const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
console.error(err.stack);
  res.status(err.statusCode).json({
    status: err.status || "error",
    message: err.message,
  });
};

export default errorHandler;