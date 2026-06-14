const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR :(', err);
    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log('GLOBAL ERROR HANDLER HIT');
  console.log('NODE_ENV =', process.env.NODE_ENV);
  console.log('ERR NAME =', err.name);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production ') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === 'CastError') error = handleCastErrorDB(error);

    sendErrorProd(error, res);
  }
};

//   console.log('1');
//   console.log(process.env.NODE_ENV);
//   console.log('2');

//   err.statusCode = err.statusCode || 500;

//   console.log('3');

//   err.status = err.status || 'error';

//   console.log('4');

//   if (process.env.NODE_ENV === 'development') {
//     console.log('5');
//     return sendErrorDev(err, res);
//   }

//   console.log('6');

//   if (process.env.NODE_ENV === 'production ') {
//     console.log('7');

//     return res.status(500).json({
//       status: 'error',
//       message: 'test'
//     });
//   }

//   console.log('8');
// };
