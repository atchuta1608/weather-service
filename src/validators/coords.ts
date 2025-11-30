import { z } from 'zod';

export const coordsSchema = z.object({
  lat: z.union([z.string(), z.number()]).transform(x => Number(x)).refine(v => !Number.isNaN(v) && v >= -90 && v <= 90, { message: 'latitude must be a number between -90 and 90' }),
  lon: z.union([z.string(), z.number()]).transform(x => Number(x)).refine(v => !Number.isNaN(v) && v >= -180 && v <= 180, { message: 'longitude must be a number between -180 and 180' })
});
