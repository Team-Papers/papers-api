import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../errors/app-error';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Prisma known request errors (constraint violations, not found, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Prisma error:', err.code, err.message);

    switch (err.code) {
      case 'P2002': // Unique constraint violation
        res.status(409).json({
          success: false,
          message: 'A record with this value already exists',
        });
        return;
      case 'P2003': // Foreign key constraint violation
        res.status(400).json({
          success: false,
          message: 'Referenced record does not exist',
        });
        return;
      case 'P2025': // Record not found
        res.status(404).json({
          success: false,
          message: 'Record not found',
        });
        return;
      default:
        break;
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error('Prisma validation error:', err.message);
    res.status(400).json({
      success: false,
      message: 'Invalid data provided',
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
