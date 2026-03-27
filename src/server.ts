import { env } from './config/env';
import { initSentry } from './config/sentry';
import app from './app';
import prisma from './config/database';
import { initializeStorage } from './config/storage';

initSentry();

const start = async () => {
  try {
    await prisma.$connect();
    await initializeStorage();

    app.listen(env.PORT, () => {
      const base = `http://localhost:${env.PORT}`;
      console.error(`
  ╔══════════════════════════════════════════════════════╗
  ║            Papers API — ${env.NODE_ENV}                  ║
  ╠══════════════════════════════════════════════════════╣
  ║                                                      ║
  ║  Server:     ${base}                          ║
  ║  Health:     ${base}/api/v1/health             ║
  ║  Swagger:    ${base}/api/v1/docs               ║
  ║  Swagger JSON: ${base}/api/v1/docs.json        ║
  ║  Database:   PostgreSQL connected                    ║
  ║  Redis:      ${env.REDIS_URL}                        ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
