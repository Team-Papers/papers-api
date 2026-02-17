import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import swaggerUi from 'swagger-ui-express';
import { corsOptions } from './config/cors';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './shared/middleware/error-handler.middleware';
import { globalLimiter } from './shared/middleware/rate-limiter.middleware';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import authorsRoutes from './modules/authors/authors.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import booksRoutes from './modules/books/books.routes';
import uploadRoutes from './modules/upload/upload.routes';
import purchasesRoutes from './modules/purchases/purchases.routes';
import libraryRoutes from './modules/library/library.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import collectionsRoutes from './modules/collections/collections.routes';
import adminRoutes from './modules/admin/admin.routes';
import filesRoutes from './modules/files/files.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';

const app = express();

// Security
const frontendOrigins = env.FRONTEND_URLS.split(',').map((url) => url.trim());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'frame-ancestors': ["'self'", ...frontendOrigins],
      },
    },
    frameguard: false, // Using CSP frame-ancestors instead (supports multiple origins)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors(corsOptions));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression & Logging
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(globalLimiter);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger docs
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/authors', authorsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/purchases', purchasesRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/collections', collectionsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/files', filesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// Error handling
app.use(errorHandler);

export default app;
