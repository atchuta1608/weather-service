const pino = require('pino');
const logger = pino();

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const reqId = req.requestId;
  const meta = { err: err?.message || String(err), requestId: reqId };

  if (err && err.status && Number.isInteger(err.status)) {
    logger.warn(meta, 'Handled error');
    return res.status(err.status).json({ error: err.message, requestId: reqId });
  }

  logger.error(meta, 'Unhandled error');
  return res.status(502).json({ error: 'Bad gateway', requestId: reqId });
}

module.exports = errorHandler;
