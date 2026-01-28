import { env } from './config/env';
import app from './app';
import prisma from './config/database';

const start = async () => {
  try {
    await prisma.$connect();

    app.listen(env.PORT, () => {
      console.error(`
  ╔══════════════════════════════════════════════════╗
  ║           Paper's API — ${env.NODE_ENV}              ║
  ╠══════════════════════════════════════════════════╣
  ║                                                  ║
  ║  Server:    http://localhost:${env.PORT}              ║
  ║  Health:    http://localhost:${env.PORT}/api/v1/health ║
  ║  Database:  PostgreSQL connected                 ║
  ║  Redis:     ${env.REDIS_URL}            ║
  ║                                                  ║
  ║  Routes:                                         ║
  ║  POST /api/v1/auth/register                      ║
  ║  POST /api/v1/auth/login                         ║
  ║  POST /api/v1/auth/google                        ║
  ║  POST /api/v1/auth/refresh                       ║
  ║  POST /api/v1/auth/forgot-password               ║
  ║  POST /api/v1/auth/reset-password                ║
  ║  POST /api/v1/auth/verify-email                  ║
  ║  GET  /api/v1/auth/me                            ║
  ║  POST /api/v1/auth/logout                        ║
  ║  GET  /api/v1/users/:id                          ║
  ║  PUT  /api/v1/users/:id                          ║
  ║  DELETE /api/v1/users/:id                        ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
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
