# Papers — Backend API

API REST de la plateforme **Papers - Livres et Histoires**.
Gestion de l'authentification, des livres, achats, bibliotheque, revenus auteurs et administration.

## Stack

- **Node.js 20** + **TypeScript**
- **Express 5**
- **Prisma 7** (ORM PostgreSQL)
- **Redis** (cache, rate limiting)
- **Firebase** (Auth Google, Storage)
- **Docker** (production)

## Liens

| Environnement | URL |
|---------------|-----|
| **Production** | https://api.papers237.duckdns.org |
| **Health Check** | https://api.papers237.duckdns.org/api/v1/health |
| **Swagger Docs** | https://api.papers237.duckdns.org/api/v1/docs |

## Developpement

```bash
# Installation
npm install

# Demarrer PostgreSQL + Redis (Docker)
docker compose up -d

# Migrations
npx prisma migrate dev

# Seed
npx prisma db seed

# Serveur de developpement
npm run dev

# Build
npm run build
```

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs.

## Modules API

| Module | Base URL | Description |
|--------|----------|-------------|
| Auth | `/api/v1/auth` | Inscription, connexion, tokens |
| Users | `/api/v1/users` | Profils utilisateurs |
| Authors | `/api/v1/authors` | Profils et stats auteurs |
| Books | `/api/v1/books` | CRUD et catalogue livres |
| Categories | `/api/v1/categories` | Categories de livres |
| Purchases | `/api/v1/purchases` | Achats et paiements |
| Library | `/api/v1/library` | Bibliotheque et progression |
| Reviews | `/api/v1/books/:id/reviews` | Avis et notes |
| Upload | `/api/v1/upload` | Upload couvertures et manuscrits |
| Admin | `/api/v1/admin` | Dashboard, moderation, categories |

## Deploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les details d'hebergement et CI/CD.
