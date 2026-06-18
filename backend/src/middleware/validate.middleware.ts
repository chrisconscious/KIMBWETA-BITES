import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { badRequest } from '../utils/response';

type Source = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 * Validates req[source] against the schema and returns 400 on failure.
 */
export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      badRequest(res, 'Validation failed', errors);
      return;
    }
    // Replace source with parsed/coerced values
    req[source] = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }
  return errors;
}
