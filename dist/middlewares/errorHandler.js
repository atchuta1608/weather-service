"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const errorHandler = (err, req, res, next) => {
    const reqId = req.requestId;
    const meta = { err: err?.message || String(err), requestId: reqId };
    if (err && err.status && Number.isInteger(err.status)) {
        logger.warn(meta, 'Handled error');
        return res.status(err.status).json({ error: err.message, requestId: reqId });
    }
    logger.error(meta, 'Unhandled error');
    return res.status(502).json({ error: 'Bad gateway', requestId: reqId });
};
exports.default = errorHandler;
