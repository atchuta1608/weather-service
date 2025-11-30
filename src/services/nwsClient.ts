import client from './httpClient';
import pino from 'pino';

const logger = pino();

export interface ForecastPeriod {
  name?: string;
  shortForecast?: string;
  temperature?: number;
  isDaytime?: boolean;
  startTime?: string;
  endTime?: string;
}

export async function getShortForecastForPoint(lat: number, lon: number): Promise<ForecastPeriod | null> {
  try {
    const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
    logger.info({ url: pointUrl }, 'Requesting NWS point metadata');
    const pointResp = await client.get(pointUrl);

    const forecastUrl = pointResp.data?.properties?.forecast as string | undefined;
    if (!forecastUrl) {
      logger.warn({ lat, lon }, 'No forecast URL in points response');
      return null;
    }

    logger.info({ url: forecastUrl }, 'Requesting NWS forecast');
    const forecastResp = await client.get(forecastUrl);
    const periods = forecastResp.data?.properties?.periods as ForecastPeriod[] | undefined;
    if (!Array.isArray(periods) || periods.length === 0) return null;

    // Prefer the period that contains the current time. If none found,
    // choose a period matching the current day/night, else fallback to the first period.
    const now = new Date();

    const currentPeriod = periods.find(p => {
      if (!p.startTime || !p.endTime) return false;
      const start = new Date(p.startTime);
      const end = new Date(p.endTime);
      return start <= now && now < end;
    });

    if (currentPeriod) return currentPeriod;

    const hourUTC = now.getUTCHours();
    const isCurrentlyDaytime = hourUTC >= 6 && hourUTC < 18;

    const matchedPeriod = periods.find(p => p.isDaytime === isCurrentlyDaytime) || periods[0];

    return matchedPeriod || null;
  } catch (err) {
    logger.error({ err, lat, lon }, 'Error fetching NWS data');
    throw err;
  }
}
