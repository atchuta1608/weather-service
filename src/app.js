const express = require('express');
const pino = require('pino');
const cors = require('cors');
const logger = pino();
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

app.get('/forecast', async (req, res, next) => {
  try {
    const parsed = coordsSchema.parse({ lat: req.query.lat, lon: req.query.lon });
    const lat = Number(parsed.lat);
    const lon = Number(parsed.lon);

    const period = await nwsClient.getShortForecastForPoint(lat, lon);
    if (!period) {
      return next(new HttpError(404, 'No forecast data available for provided coordinates'));
    }

    const shortForecast = period.shortForecast || period.name || 'No forecast';
    const temperature = period.temperature;
    const characterization = classifyTemp(temperature);

    return res.json({ shortForecast, temperature, characterization });
  } catch (err) {
    // zod throws ZodError instances; they have .name === 'ZodError'
    if (err && err.name === 'ZodError') {
      logger.warn({ err }, 'Validation failed');
      return next(new HttpError(422, 'Invalid lat/lon query parameters'));
    }
    return next(err);
  }
});

// centralized error handler
app.use(errorHandler);

module.exports = app;
