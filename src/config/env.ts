import { z } from 'zod/v4';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Firebase (optional - only needed for Google Auth)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),

  // Local Storage Configuration
  STORAGE_PATH: z.string().default('/var/www/papers-storage'),
  COVERS_PUBLIC_URL: z.string().default('/media/covers'),

  FRONTEND_URLS: z
    .string()
    .default(
      'http://localhost:3000,http://localhost:3001,http://localhost:3002,https://papers237.duckdns.org',
    ),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@papers.app'),

  // Wechango Payment Gateway
  WECHANGO_API_KEY: z.string().default(''),
  WECHANGO_BASE_URL: z.string().default('https://api.wechango.seed-innov.com/api/v1'),
  WECHANGO_WEBHOOK_SECRET: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
