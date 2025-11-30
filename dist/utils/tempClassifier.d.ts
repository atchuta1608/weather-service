export type TempCategory = 'hot' | 'cold' | 'moderate' | 'unknown';
export declare function classifyTemp(tempF: number | null | undefined): TempCategory;
