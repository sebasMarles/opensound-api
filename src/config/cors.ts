import { CorsOptions } from 'cors';
import { getEnv } from './env';

const env = getEnv();

const defaultOrigins = ['https://opensound.icu', 'exp://127.0.0.1:19000'];

const allowedOrigins = new Set([...defaultOrigins, ...env.corsOrigins]);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, origin || true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
