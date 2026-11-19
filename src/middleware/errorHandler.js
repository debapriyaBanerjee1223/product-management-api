const createResponse = (success, data = null, error = null) => ({
  success,
  data,
  error
});

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.statusCode === 400 && err.errors) {
    return res.status(400).json(createResponse(false, null, {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors
    }));
  }

  if (err.statusCode === 409 && err.errors) {
    return res.status(409).json(createResponse(false, null, {
      message: err.message,
      code: 'CONFLICT',
      details: err.errors
    }));
  }

  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    return res.status(400).json(createResponse(false, null, {
      message: 'Invalid JSON payload',
      code: 'INVALID_JSON'
    }));
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json(createResponse(false, null, {
    message,
    code: err.code || 'INTERNAL_ERROR'
  }));
};

export const notFoundHandler = (req, res) => {
  res.status(404).json(createResponse(false, null, {
    message: 'Route not found',
    code: 'NOT_FOUND'
  }));
};