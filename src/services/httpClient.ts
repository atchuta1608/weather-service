import axios from 'axios';
import axiosRetry from 'axios-retry';
import pino from 'pino';

const logger = pino();

const client = axios.create({ timeout: 15000, headers: { 'User-Agent': 'weather-service-demo (email@example.com)' } });
axiosRetry(client, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay, 
  retryCondition: (err) => {
    // Retry on network errors, timeouts, and idempotent request errors
    return axiosRetry.isNetworkOrIdempotentRequestError(err) || err?.code === 'ECONNABORTED';
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

export default client;
