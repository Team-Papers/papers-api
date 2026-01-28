import { Request, Response, NextFunction } from 'express';
import redis from '../../config/redis';
import { AppError } from '../errors/app-error';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  prefix?: string;
}

export const rateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, prefix = 'rl' } = options;
  const windowSec = Math.ceil(windowMs / 1000);

  return async (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${prefix}:${ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      if (current > max) {
        throw new AppError('Too many requests, please try again later', 429);
      }

      next();
    } catch (err) {
      if (err instanceof AppError) {
        next(err);
        return;
      }
      next();
    }
  };
};

export const globalLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  prefix: 'rl:global',
});

export const authLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  prefix: 'rl:auth',
});
