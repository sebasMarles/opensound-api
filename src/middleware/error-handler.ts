import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
};

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.flatten(),
    });
  }

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error({ err }, 'Internal server error');
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details,
  });
};
