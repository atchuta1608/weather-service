import { ErrorRequestHandler } from 'express';
import pino from 'pino';

const logger = pino();

const errorHandler: ErrorRequestHandler = (err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  const reqId = (req as any).requestId;
  const meta = { err: err?.message || String(err), requestId: reqId };

  if (err && (err as any).status && Number.isInteger((err as any).status)) {
    logger.warn(meta, 'Handled error');
    return res.status((err as any).status).json({ error: (err as any).message, requestId: reqId });
  }

  logger.error(meta, 'Unhandled error');
  return res.status(502).json({ error: 'Bad gateway', requestId: reqId });
};

export default errorHandler;
