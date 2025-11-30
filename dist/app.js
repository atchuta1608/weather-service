"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pino_1 = __importDefault(require("pino"));
const cors_1 = __importDefault(require("cors"));
const coords_1 = require("./validators/coords");
const nwsClient_1 = require("./services/nwsClient");
const tempClassifier_1 = require("./utils/tempClassifier");
const requestId_1 = __importDefault(require("./middlewares/requestId"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const HttpError_1 = __importDefault(require("./errors/HttpError"));
const logger = (0, pino_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(requestId_1.default);
app.get('/forecast', async (req, res, next) => {
    try {
        const parsed = coords_1.coordsSchema.parse({ lat: req.query.lat, lon: req.query.lon });
        const lat = Number(parsed.lat);
        const lon = Number(parsed.lon);
        const period = await (0, nwsClient_1.getShortForecastForPoint)(lat, lon);
        if (!period) {
            return next(new HttpError_1.default(404, 'No forecast data available for provided coordinates'));
        }
        const shortForecast = period.shortForecast || period.name || 'No forecast';
        const temperature = period.temperature;
        const characterization = (0, tempClassifier_1.classifyTemp)(temperature);
        return res.json({ shortForecast, temperature, characterization });
    }
    catch (err) {
        if (err && err.name === 'ZodError') {
            logger.warn({ err }, 'Validation failed');
            return next(new HttpError_1.default(422, 'Invalid lat/lon query parameters'));
        }
        return next(err);
    }
});
app.use(errorHandler_1.default);
exports.default = app;
