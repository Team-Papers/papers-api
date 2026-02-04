# Configuration du Stockage Local - Papers API

## Architecture

```
/var/www/papers-storage/
├── covers/                    # 🔓 Public (servi par Nginx)
│   └── {uuid}.jpg             # Images de couverture
│
├── books/                     # 🔒 Privé (accès via API uniquement)
│   └── {uuid}.pdf             # Fichiers PDF/ePub
│
└── temp/                      # 🗑️ Fichiers temporaires
    └── (nettoyés automatiquement)
```

## Installation sur le serveur

### 1. Créer les répertoires

```bash
# Créer la structure de dossiers
sudo mkdir -p /var/www/papers-storage/{covers,books,temp}

# Définir le propriétaire (l'utilisateur qui exécute l'API)
sudo chown -R softengine:softengine /var/www/papers-storage

# Permissions
chmod 755 /var/www/papers-storage
chmod 755 /var/www/papers-storage/covers    # Public en lecture
chmod 700 /var/www/papers-storage/books     # Privé
chmod 700 /var/www/papers-storage/temp      # Privé
```

### 2. Configurer Nginx

Ajouter la configuration dans le fichier Nginx du site (ex: `/etc/nginx/sites-available/api.papers237.duckdns.org`):

```nginx
server {
    listen 443 ssl;
    server_name api.papers237.duckdns.org;

    # ... autres configurations SSL ...

    # Servir les couvertures (public avec cache)
    location /media/covers/ {
        alias /var/www/papers-storage/covers/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";

        # Autoriser uniquement les images
        location ~ \.(jpg|jpeg|png|webp)$ {
            try_files $uri =404;
        }
    }

    # Proxy vers l'API Node.js
    location / {
        proxy_pass http://localhost:8050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Puis recharger Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Variables d'environnement (.env.production)

```env
# Local Storage
STORAGE_PATH=/var/www/papers-storage
COVERS_PUBLIC_URL=https://api.papers237.duckdns.org/media/covers
```

## Flux de téléchargement sécurisé

### Upload de couverture (public)

```
POST /api/v1/upload/cover
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [image.jpg]

Response:
{
  "success": true,
  "data": {
    "url": "/media/covers/abc123.jpg"
  }
}
```

L'URL retournée est servie directement par Nginx avec cache.

### Upload de livre (privé)

```
POST /api/v1/upload/book
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [book.pdf]

Response:
{
  "success": true,
  "data": {
    "url": "abc123.pdf",      # Juste le nom du fichier (pas d'URL publique)
    "size": 5242880,
    "format": "pdf"
  }
}
```

### Téléchargement de livre (sécurisé)

**Étape 1: Générer un lien de téléchargement**
```
POST /api/v1/files/generate-link
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookId": "book-uuid-here"
}

Response:
{
  "success": true,
  "data": {
    "downloadUrl": "/api/v1/files/download?token=eyJ...",
    "expiresAt": "2026-02-04T12:30:00.000Z",
    "expiresIn": "15 minutes"
  }
}
```

**Étape 2: Télécharger avec le token**
```
GET /api/v1/files/download?token=eyJ...

Response: Stream du fichier PDF/ePub
Headers:
  Content-Disposition: attachment; filename="Mon_Livre.pdf"
  Content-Type: application/pdf
```

## Sécurité

### Tokens signés

Les tokens de téléchargement sont signés avec HMAC-SHA256 et contiennent:
- `fileName`: Nom du fichier à télécharger
- `userId`: ID de l'utilisateur autorisé
- `bookId`: ID du livre
- `exp`: Timestamp d'expiration (15 minutes)

Le token ne peut pas être:
- Modifié (signature invalide)
- Réutilisé après expiration
- Utilisé par un autre utilisateur

### Vérifications avant téléchargement

1. ✅ Token valide et non expiré
2. ✅ L'utilisateur a acheté le livre OU est l'auteur
3. ✅ Le fichier existe sur le serveur

## Sauvegarde

Ajouter une tâche cron pour sauvegarder les fichiers:

```bash
# Sauvegarde quotidienne à 3h du matin
0 3 * * * rsync -avz /var/www/papers-storage/ /backup/papers-storage/
```

## Nettoyage des fichiers temporaires

```bash
# Supprimer les fichiers temporaires de plus de 24h
0 4 * * * find /var/www/papers-storage/temp -type f -mtime +1 -delete
```

## Migration depuis Firebase Storage

Si vous avez des fichiers existants sur Firebase Storage:

1. Télécharger tous les fichiers avec `gsutil`:
   ```bash
   gsutil -m cp -r gs://papersbook-f3826.appspot.com/covers/* /var/www/papers-storage/covers/
   gsutil -m cp -r gs://papersbook-f3826.appspot.com/books/* /var/www/papers-storage/books/
   ```

2. Mettre à jour les URLs en base de données:
   ```sql
   -- Mettre à jour les couvertures
   UPDATE books
   SET cover_url = REPLACE(cover_url, 'https://storage.googleapis.com/papersbook-f3826.appspot.com/covers/', '/media/covers/')
   WHERE cover_url LIKE 'https://storage.googleapis.com/%';

   -- Mettre à jour les fichiers (garder juste le nom)
   UPDATE books
   SET file_url = SUBSTRING(file_url FROM '[^/]+$')
   WHERE file_url LIKE 'https://storage.googleapis.com/%';
   ```
