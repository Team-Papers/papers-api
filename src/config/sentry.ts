import * as Sentry from '@sentry/node';
import { env } from './env';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn('[Sentry] No DSN configured, skipping initialization');
    return;
  }
  Sentry.init({
    dsn,
    environment: env.NODE_ENV || 'development',
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
  console.log('[Sentry] Initialized for', env.NODE_ENV);
}

export { Sentry };
