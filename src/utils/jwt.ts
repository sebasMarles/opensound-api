import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { getEnv } from '../config/env';

const env = getEnv();

export interface JwtPayload {
  sub: string;
  email: string;
}

const createTokenOptions = (expiresIn: StringValue) => ({
  expiresIn,
  jwtid: randomUUID(),
});

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, createTokenOptions(env.ACCESS_TOKEN_TTL as StringValue));
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, createTokenOptions(env.REFRESH_TOKEN_TTL as StringValue));
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};
