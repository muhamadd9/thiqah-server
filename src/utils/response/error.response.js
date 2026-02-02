export const asyncHandler = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((err) => {
      err.statusCode = err.statusCode || 500;
      next(err);
    });
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  const status = err.statusCode || 400;

  if (process.env.MODE === "DEV") {
    return res.status(status).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(status).json({
    success: false,
    message: err.message,
  });
};
