const axios = require('axios');
const axiosRetry = require('axios-retry');
const pino = require('pino');

const logger = pino();

const client = axios.create({ timeout: 7000, headers: { 'User-Agent': 'weather-service-demo (email@example.com)' } });
axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay, retryCondition: axiosRetry.isNetworkOrIdempotentRequestError });

client.interceptors.request.use(cfg => {
  logger.info({ url: cfg.url }, 'HTTP request');
  return cfg;
});

client.interceptors.response.use(r => r, e => {
  logger.warn({ err: e?.message || e, url: e?.config?.url }, 'HTTP request failed');
  return Promise.reject(e);
});

module.exports = client;
