import express, { Request, Response, NextFunction } from 'express';
import logger from './logger';
import cors from 'cors';
import { coordsSchema } from './validators/coords';
import { getShortForecastForPoint } from './services/nwsClient';
import { classifyTemp } from './utils/tempClassifier';
import requestIdMiddleware from './middlewares/requestId';
import errorHandler from './middlewares/errorHandler';
import HttpError from './errors/HttpError';


const app = express();
app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main forecast endpoint
app.get('/forecast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if required parameters are provided
    if (!req.query.lat || !req.query.lon) {
      return next(new HttpError(
        400,
        'Missing required query parameters: lat and lon',
        { required: ['lat', 'lon'] }
      ));
    }

    // Validate and parse coordinates
    let parsed;
    try {
      parsed = coordsSchema.parse({
        lat: req.query.lat as string,
        lon: req.query.lon as string,
      });
    } catch (err: any) {
      logger.warn({ err: err.errors }, 'Validation failed');
      return next(new HttpError(
        422,
        'Invalid lat/lon query parameters',
        { errors: err.errors }
      ));
    }

    const lat = Number(parsed.lat);
    const lon = Number(parsed.lon);

    logger.info({ lat, lon }, 'Fetching forecast');
    const period = await getShortForecastForPoint(lat, lon);
    if (!period) {
      return next(new HttpError(404, 'No forecast data available for provided coordinates'));
    }

    const shortForecast = period.shortForecast || period.name || 'No forecast';
    const temperature = period.temperature;
    const characterization = classifyTemp(temperature);

    logger.info({ lat, lon, shortForecast, temperature }, 'Forecast retrieved successfully');
    return res.status(200).json({ shortForecast, temperature, characterization });
  } catch (err: any) {
    return next(err);
  }
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    requestId: (req as any).requestId || 'unknown',
  });
});

app.use(errorHandler);

export default app;
