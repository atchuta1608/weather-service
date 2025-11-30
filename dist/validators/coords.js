"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordsSchema = void 0;
const zod_1 = require("zod");
exports.coordsSchema = zod_1.z.object({
    lat: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(x => Number(x)).refine(v => !Number.isNaN(v) && v >= -90 && v <= 90, { message: 'lat must be a number between -90 and 90' }),
    lon: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(x => Number(x)).refine(v => !Number.isNaN(v) && v >= -180 && v <= 180, { message: 'lon must be a number between -180 and 180' })
});
