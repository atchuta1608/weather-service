import { z } from 'zod';
export declare const coordsSchema: z.ZodObject<{
    lat: z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>, number, string | number>;
    lon: z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>, number, string | number>;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lon: number;
}, {
    lat: string | number;
    lon: string | number;
}>;
