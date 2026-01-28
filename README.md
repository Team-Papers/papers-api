# Paper's API

Backend API for the Paper's platform — a digital book publishing and reading platform.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Database**: PostgreSQL 16 (Prisma 7 ORM)
- **Cache**: Redis 7
- **Auth**: JWT (access + refresh tokens), Google OAuth (Firebase Admin SDK)
- **Storage**: Firebase Storage (covers), Cloudflare R2 (books — planned)
- **Validation**: Zod v4

## Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- Firebase project with service account

## Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
npm run docker:up

# Copy environment file and fill values
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (admin, test users, categories)
npm run prisma:seed

# Start development server
npm run dev
```

## Default Test Accounts

| Role   | Email              | Password     |
|--------|--------------------|--------------|
| Admin  | admin@papers.app   | Admin@2026   |
| Author | auteur@papers.app  | Author@2026  |
| Reader | lecteur@papers.app | Reader@2026  |

## API Routes

### Auth
| Method | Endpoint                        | Auth | Description                |
|--------|---------------------------------|------|----------------------------|
| POST   | /api/v1/auth/register           | No   | Register with email        |
| POST   | /api/v1/auth/login              | No   | Login with email           |
| POST   | /api/v1/auth/google             | No   | Login with Google          |
| POST   | /api/v1/auth/refresh            | No   | Refresh access token       |
| POST   | /api/v1/auth/forgot-password    | No   | Send reset email           |
| POST   | /api/v1/auth/reset-password     | No   | Reset password             |
| POST   | /api/v1/auth/verify-email       | No   | Verify email               |
| GET    | /api/v1/auth/me                 | Yes  | Current user profile       |
| POST   | /api/v1/auth/logout             | Yes  | Logout                     |

### Users
| Method | Endpoint              | Auth | Description        |
|--------|-----------------------|------|--------------------|
| GET    | /api/v1/users/:id     | Yes  | Get profile        |
| PUT    | /api/v1/users/:id     | Yes  | Update profile     |
| DELETE | /api/v1/users/:id     | Yes  | Delete account     |

### Authors
| Method | Endpoint                | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| POST   | /api/v1/authors/apply   | Yes  | Apply for author status  |
| GET    | /api/v1/authors/me      | Yes  | My author profile        |
| PUT    | /api/v1/authors/me      | Yes  | Update author profile    |
| GET    | /api/v1/authors         | No   | List public authors      |
| GET    | /api/v1/authors/:id     | No   | Author public profile    |

### Categories
| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| GET    | /api/v1/categories              | No   | List categories          |
| GET    | /api/v1/categories/:id          | No   | Category detail          |
| GET    | /api/v1/categories/:id/books    | No   | Books in category        |

### Books
| Method | Endpoint                     | Auth | Description              |
|--------|------------------------------|------|--------------------------|
| GET    | /api/v1/books                | No   | Public catalogue         |
| GET    | /api/v1/books/search         | No   | Search books             |
| GET    | /api/v1/books/me             | Yes  | My books (author)        |
| POST   | /api/v1/books                | Yes  | Create book (author)     |
| GET    | /api/v1/books/:id            | No   | Book detail              |
| GET    | /api/v1/books/:id/preview    | No   | Book preview             |
| PUT    | /api/v1/books/:id            | Yes  | Update book (author)     |
| DELETE | /api/v1/books/:id            | Yes  | Delete book (author)     |
| POST   | /api/v1/books/:id/submit     | Yes  | Submit for review        |

### Upload
| Method | Endpoint                | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| POST   | /api/v1/upload/cover    | Yes  | Upload cover image       |
| POST   | /api/v1/upload/book     | Yes  | Upload book file         |

## Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # TypeScript compilation
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
```

## Project Structure

```
src/
  config/          # Environment, database, Redis, Firebase, CORS
  generated/       # Prisma generated client
  modules/
    auth/          # Authentication (register, login, OAuth, JWT)
    users/         # User profile management
    authors/       # Author profiles and applications
    books/         # Book CRUD, catalogue, search
    categories/    # Book categories
    upload/        # File upload (covers, books)
  shared/
    errors/        # Custom error classes
    middleware/    # Auth, validation, rate limiting, error handler
    utils/         # Response helpers, pagination, slug generation
  app.ts           # Express app configuration
  server.ts        # Server entry point
```

## Branching Strategy

- `main` — production
- `develop` — integration
- `feature/PA-XX-description` — feature branches
- Conventional Commits: `feat(scope):`, `fix(scope):`, `chore(scope):`
