const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    error: err
  });
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
