import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      ok: false,
      status,
      msg: err.message,
      stack: err.stack,
    });
    return;
  }

  res.status(statusCode).json({
    ok: false,
    status,
    msg: err.isOperational ? err.message : 'Something went wrong',
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    ok: false,
    msg: 'Resource not found',
  });
};

export class AppErrorClass extends Error implements AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default errorHandler;
