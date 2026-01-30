# Déploiement — Papers API (Backend)

## Infrastructure

| Élément | Détail |
|---------|--------|
| **Serveur** | VPS Contabo (Ubuntu) — `84.247.183.206` |
| **URL de production** | https://api.papers237.duckdns.org |
| **Port interne** | `8050` (mappé vers `8000` dans le container) |
| **Technologie** | Docker Compose (API + PostgreSQL + Redis) |
| **SSL** | Let's Encrypt (Certbot, renouvellement automatique) |
| **Reverse proxy** | Nginx |
| **Répertoire sur le VPS** | `/home/softengine/papers-api` |

## Architecture Docker

```
papers-api/
├── docker-compose.prod.yml    # Orchestration production
├── Dockerfile                 # Build multi-stage (builder + runner)
├── .env.production            # Variables d'environnement (sur le VPS uniquement)
└── prisma/
    └── schema.prisma          # Schéma base de données
```

### Containers

| Container | Image | Port (hôte:container) | Volume |
|-----------|-------|-----------------------|--------|
| `papers-api` | Build local (Dockerfile) | `8050:8000` | — |
| `papers-postgres` | `postgres:16-alpine` | `5434:5432` | `papers_postgres_data` |
| `papers-redis` | `redis:7-alpine` | `6380:6379` | `papers_redis_data` |

## Configuration Nginx

Fichier : `/etc/nginx/sites-enabled/papers-api`

```nginx
server {
    server_name api.papers237.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:8050;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 110M;

    # SSL géré par Certbot
}
```

## CI/CD (GitHub Actions)

**Déclencheur** : Push sur la branche `main`

**Workflow** : `.github/workflows/deploy.yml`

```
Push main → SSH vers VPS → git pull → docker build → docker up → prisma migrate → health check
```

### Secrets GitHub requis

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | `84.247.183.206` |
| `VPS_USER` | `softengine` |
| `VPS_PASSWORD` | *(mot de passe SSH)* |

## Déploiement manuel

```bash
ssh softengine@84.247.183.206
cd /home/softengine/papers-api
git pull origin main
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml up -d api
sleep 10
docker exec papers-api npx prisma migrate deploy
curl -sf http://localhost:8050/api/v1/health || echo "ERREUR"
```

## Vérification

```bash
# Health check
curl https://api.papers237.duckdns.org/api/v1/health

# Logs
docker logs papers-api --tail 50

# Statut containers
docker compose -f docker-compose.prod.yml ps
```

## Variables d'environnement (.env.production)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL (`postgresql://papers:***@postgres:5432/papers_db`) |
| `REDIS_URL` | URL Redis (`redis://redis:6379`) |
| `JWT_SECRET` | Secret pour les tokens JWT |
| `JWT_REFRESH_SECRET` | Secret pour les refresh tokens |
| `FRONTEND_URLS` | Origines CORS autorisées |
| `FIREBASE_*` | Credentials Firebase (Storage + Auth) |
