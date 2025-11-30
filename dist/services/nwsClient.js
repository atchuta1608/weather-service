"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShortForecastForPoint = void 0;
const httpClient_1 = __importDefault(require("./httpClient"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
async function getShortForecastForPoint(lat, lon) {
    try {
        const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
        logger.info({ url: pointUrl }, 'Requesting NWS point metadata');
        const pointResp = await httpClient_1.default.get(pointUrl);
        const forecastUrl = pointResp.data?.properties?.forecast;
        if (!forecastUrl) {
            logger.warn({ lat, lon }, 'No forecast URL in points response');
            return null;
        }
        logger.info({ url: forecastUrl }, 'Requesting NWS forecast');
        const forecastResp = await httpClient_1.default.get(forecastUrl);
        const periods = forecastResp.data?.properties?.periods;
        if (!Array.isArray(periods) || periods.length === 0)
            return null;
        const todayPeriod = periods.find(p => /today/i.test(p.name || ''))
            || periods.find(p => p.isDaytime)
            || periods[0];
        return todayPeriod || null;
    }
    catch (err) {
        logger.error({ err, lat, lon }, 'Error fetching NWS data');
        throw err;
    }
}
exports.getShortForecastForPoint = getShortForecastForPoint;
