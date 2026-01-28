import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { corsOptions } from './config/cors';
import { errorHandler } from './shared/middleware/error-handler.middleware';
import { globalLimiter } from './shared/middleware/rate-limiter.middleware';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import authorsRoutes from './modules/authors/authors.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import booksRoutes from './modules/books/books.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

// Security
app.use(helmet());
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

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/authors', authorsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Error handling
app.use(errorHandler);

export default app;
