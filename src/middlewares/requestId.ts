import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';

const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  (req as any).requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};

export default requestIdMiddleware;
