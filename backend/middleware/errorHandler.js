exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  
  let error = { ...err };
  error.message = err.message;
  
  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Data dengan nilai tersebut sudah ada';
    error = { message };
  }
  
  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message };
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};