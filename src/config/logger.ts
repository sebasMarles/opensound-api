import pino from 'pino';
import { getEnv } from './env';

const env = getEnv();

const isDev = env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});
