const logger = require('../logger');
const HttpError = require('../errors/HttpError');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const reqId = req.requestId || 'unknown';

  // Handle custom HttpError
  if (err instanceof HttpError) {
    // 204 No Content should not include a response body
    if (err.status === 204) {
      logger.info({ status: 204, requestId: reqId }, 'No content for request');
      return res.status(204).end();
    }

    const logLevel = err.status >= 500 ? 'error' : 'warn';
    logger[logLevel](
      { error: err.message, status: err.status, requestId: reqId },
      'HTTP error response'
    );
    return res.status(err.status).json({
      error: err.message,
      ...(err.details && { details: err.details }),
      requestId: reqId,
    });
  }

  // Handle Zod validation errors (if passed here)
  if (err && err.name === 'ZodError') {
    logger.warn(
      { error: 'Validation error', details: err.errors, requestId: reqId },
      'Input validation failed'
    );
    return res.status(422).json({
      error: 'Invalid input',
      details: err.errors,
      requestId: reqId,
    });
  }

  // Fallback for unhandled errors
  logger.error(
    { error: err?.message || String(err), stack: err instanceof Error ? err.stack : undefined, requestId: reqId },
    'Unhandled server error'
  );
  return res.status(500).json({
    error: 'Internal server error',
    requestId: reqId,
  });
}

module.exports = errorHandler;
