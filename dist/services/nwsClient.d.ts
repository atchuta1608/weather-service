export interface ForecastPeriod {
    name?: string;
    shortForecast?: string;
    temperature?: number;
    isDaytime?: boolean;
}
export declare function getShortForecastForPoint(lat: number, lon: number): Promise<ForecastPeriod | null>;
