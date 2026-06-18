import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: { service: 'kimbweta-api' },
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.otp'],
    censor: '[REDACTED]',
  },
});

export type Logger = typeof logger;
