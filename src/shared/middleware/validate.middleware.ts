import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod/v4';
import { BadRequestError } from '../errors/app-error';

export const validate = (schema: ZodType, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message).join(', ');
      throw new BadRequestError(messages);
    }
    req[source] = result.data;
    next();
  };
};
