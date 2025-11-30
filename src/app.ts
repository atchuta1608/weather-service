import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import cors from 'cors';
import { coordsSchema } from './validators/coords';
import { getShortForecastForPoint } from './services/nwsClient';
import { classifyTemp } from './utils/tempClassifier';
import requestIdMiddleware from './middlewares/requestId';
import errorHandler from './middlewares/errorHandler';
import HttpError from './errors/HttpError';

const logger = pino();

const app = express();
app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);

app.get('/forecast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = coordsSchema.parse({ lat: req.query.lat as string, lon: req.query.lon as string });
    const lat = Number(parsed.lat);
    const lon = Number(parsed.lon);

    const period = await getShortForecastForPoint(lat, lon);
    if (!period) {
      return next(new HttpError(404, 'No forecast data available for provided coordinates'));
    }

    const shortForecast = period.shortForecast || period.name || 'No forecast';
    const temperature = period.temperature;
    const characterization = classifyTemp(temperature);

    return res.json({ shortForecast, temperature, characterization });
  } catch (err: any) {
    if (err && err.name === 'ZodError') {
      logger.warn({ err }, 'Validation failed');
      return next(new HttpError(422, 'Invalid lat/lon query parameters'));
    }
    return next(err);
  }
});

app.use(errorHandler);

export default app;
