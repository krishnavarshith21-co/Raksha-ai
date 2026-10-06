import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from './auth';

export function requestId(req: AuthRequest, _res: Response, next: NextFunction) {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  next();
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err);

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'CONFLICT',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referenced resource not found',
      code: 'INVALID_REFERENCE',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : message,
    code: err.code || 'INTERNAL_ERROR',
  });
}

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}
