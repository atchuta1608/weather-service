const httpClient = require('./httpClient');
const axios = require('axios');
const logger = require('../logger');
const HttpError = require('../errors/HttpError');

async function getShortForecastForPoint(lat, lon) {
  try {
    const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
    logger.info({ url: pointUrl }, 'Requesting NWS point metadata');
    let pointResp;
    try {
      pointResp = await httpClient.get(pointUrl);
    } catch (err) {
      if (axios.isAxiosError && axios.isAxiosError(err)) {
        const code = err.code;
        if (err.response?.status === 404) {
          logger.warn({ lat, lon, status: 404 }, 'Coordinates not found in NWS database');
          throw new HttpError(404, 'Location not found in National Weather Service database', { code, message: err.message });
        }
        if (err.response?.status === 400) {
          logger.warn({ lat, lon, status: 400 }, 'Invalid coordinates for NWS');
          throw new HttpError(400, 'Invalid coordinates provided to National Weather Service', { code, message: err.message });
        }
        if (code === 'ECONNABORTED') {
          logger.error({ lat, lon }, 'NWS point endpoint timeout after retries');
          throw new HttpError(504, 'National Weather Service gateway timeout', { code, message: err.message });
        }
        if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'EAI_AGAIN') {
          logger.error({ lat, lon, code }, 'NWS point endpoint unreachable');
          throw new HttpError(503, 'National Weather Service is unavailable', { code, message: err.message });
        }
        logger.error({ lat, lon, err: err.message }, 'NWS point endpoint error');
        throw new HttpError(502, 'Failed to reach National Weather Service', { code, message: err.message });
      }
      logger.error({ lat, lon, err: err?.message ?? String(err) }, 'NWS point endpoint non-axios error');
      throw new HttpError(502, 'Failed to reach National Weather Service', { message: String(err) });
    }

    const forecastUrl = pointResp.data?.properties?.forecast;
    if (!forecastUrl) {
      logger.warn({ lat, lon, status: 204 }, 'No forecast URL in points response');
      throw new HttpError(204, 'No forecast data available');
    }

    logger.info({ url: forecastUrl }, 'Requesting NWS forecast');
    let forecastResp;
    try {
      forecastResp = await httpClient.get(forecastUrl);
    } catch (err) {
      if (axios.isAxiosError && axios.isAxiosError(err)) {
        const code = err.code;
        if (code === 'ECONNABORTED') {
          logger.error({ forecastUrl }, 'NWS forecast endpoint timeout after retries');
          throw new HttpError(504, 'National Weather Service gateway timeout', { code, message: err.message });
        }
        if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'EAI_AGAIN') {
          logger.error({ forecastUrl, code }, 'NWS forecast endpoint unreachable');
          throw new HttpError(503, 'National Weather Service is unavailable', { code, message: err.message });
        }
        logger.error({ forecastUrl, err: err.message }, 'NWS forecast endpoint error');
        throw new HttpError(502, 'Failed to reach National Weather Service', { code, message: err.message });
      }
      logger.error({ forecastUrl, err: err?.message ?? String(err) }, 'NWS forecast non-axios error');
      throw new HttpError(502, 'Failed to reach National Weather Service', { message: String(err) });
    }

    const periods = forecastResp.data?.properties?.periods;
    if (!Array.isArray(periods) || periods.length === 0) {
      logger.warn({ lat, lon, status: 204 }, 'No forecast periods in response');
      throw new HttpError(204, 'No forecast periods available');
    }

    // Prefer the period that covers the current time. If none found,
    // choose a period matching the current day/night, else fallback to the first period.
    const now = new Date();

    // Find the period that contains the current moment (uses ISO timestamps with offsets).
    const currentPeriod = periods.find(p => {
      const start = new Date(p.startTime);
      const end = new Date(p.endTime);
      return start <= now && now < end;
    });

    if (currentPeriod) return currentPeriod;

    // No exact matching period found. Decide day vs night using UTC hours as a reasonable fallback.
    // (Period times include timezone offsets, so for absolute correctness you'd map to the
    // location timezone; UTC-based heuristic is acceptable for choosing day/night here.)
    const hourUTC = now.getUTCHours();
    const isCurrentlyDaytime = hourUTC >= 6 && hourUTC < 18;

    const matchedPeriod = periods.find(p => p.isDaytime === isCurrentlyDaytime) || periods[0];

    return matchedPeriod;
  } catch (err) {
    // Re-throw HttpError as-is, wrap others with details
    if (err instanceof HttpError) {
      throw err;
    }
    const details = { message: err instanceof Error ? err.message : String(err), stack: err instanceof Error ? err.stack : undefined };
    logger.error({ err: details, lat, lon }, 'Unexpected error fetching NWS data');
    throw new HttpError(500, 'Unexpected error fetching forecast data', details);
  }
}

module.exports = { getShortForecastForPoint };
