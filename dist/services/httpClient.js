"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const client = axios_1.default.create({ timeout: 15000, headers: { 'User-Agent': 'weather-service-demo (email@example.com)' } });
(0, axios_retry_1.default)(client, {
    retries: 3,
    retryDelay: axios_retry_1.default.exponentialDelay,
    retryCondition: (err) => {
        // Retry on network errors, timeouts, and idempotent request errors
        return axios_retry_1.default.isNetworkOrIdempotentRequestError(err) || err?.code === 'ECONNABORTED';
    }
});
client.interceptors.request.use(cfg => {
    logger.info({ url: cfg.url }, 'HTTP request');
    return cfg;
});
client.interceptors.response.use(r => r, e => {
    logger.warn({ err: e?.message || e, url: e?.config?.url }, 'HTTP request failed');
    return Promise.reject(e);
});
exports.default = client;
