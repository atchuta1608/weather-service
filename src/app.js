const express = require('express');
const logger = require('./logger');
const cors = require('cors');
const { coordsSchema } = require('./validators/coords');
const nwsClient = require('./services/nwsClient');
const { classifyTemp } = require('./utils/tempClassifier');
const requestIdMiddleware = require('./middlewares/requestId');
const errorHandler = require('./middlewares/errorHandler');
const HttpError = require('./errors/HttpError');

const app = express();
app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main forecast endpoint
app.get('/forecast', async (req, res, next) => {
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
      parsed = coordsSchema.parse({ lat: req.query.lat, lon: req.query.lon });
    } catch (err) {
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
    const period = await nwsClient.getShortForecastForPoint(lat, lon);
    if (!period) {
      return next(new HttpError(404, 'No forecast data available for provided coordinates'));
    }

    const shortForecast = period.shortForecast || period.name || 'No forecast';
    const temperature = period.temperature;
    const characterization = classifyTemp(temperature);

    logger.info({ lat, lon, shortForecast, temperature }, 'Forecast retrieved successfully');
    return res.status(200).json({ shortForecast, temperature, characterization });
  } catch (err) {
    return next(err);
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    requestId: req.requestId || 'unknown',
  });
});

app.use(errorHandler);
module.exports = app;
