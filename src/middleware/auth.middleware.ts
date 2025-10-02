import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../utils/jwt';
import { getUserProfile } from '../modules/auth/auth.service';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' });
  }

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyAccessToken(token);
    const user = await getUserProfile(payload.sub);
    req.user = user;
    req.refreshToken = req.headers['x-refresh-token'] as string | undefined;
    return next();
  } catch (error) {
    logger.warn({ error }, 'Unauthorized access attempt');
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyAccessToken(token);
    const user = await getUserProfile(payload.sub);
    req.user = user;
  } catch (error) {
    logger.warn({ error }, 'Failed optional authentication');
  }

  next();
};
