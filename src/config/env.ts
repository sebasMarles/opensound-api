import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    ACCESS_TOKEN_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL: z.string().default('7d'),
    CORS_ORIGINS: z.string().default(''),
  })
  .transform((value) => ({
    ...value,
    corsOrigins: value.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }));

type Env = z.infer<typeof envSchema> & { corsOrigins: string[] };

let cachedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Environment validation error', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
};
