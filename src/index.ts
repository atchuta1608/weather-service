import app from './app';
import pino from 'pino';

const logger = pino();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Weather service listening on ${PORT}`);
});
