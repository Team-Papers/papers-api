#!/bin/bash
# ==============================================
# Papers DB - Automated PostgreSQL Backup Script
# ==============================================
# Runs pg_dump inside the Docker container and saves
# compressed backups with rotation (keeps last 7 days)

BACKUP_DIR="/home/softengine/backups/postgres"
CONTAINER_NAME="papers-postgres"
DB_NAME="papers_db"
DB_USER="papers"
RETENTION_DAYS=7
DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="$BACKUP_DIR/papers_db_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Run pg_dump inside the Docker container and compress
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup OK: $BACKUP_FILE ($SIZE)"

    # Remove backups older than RETENTION_DAYS
    find "$BACKUP_DIR" -name "papers_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "[$(date)] Old backups cleaned (keeping last $RETENTION_DAYS days)"
else
    echo "[$(date)] ERROR: Backup failed!" >&2
    rm -f "$BACKUP_FILE"  # Remove empty/corrupt file
    exit 1
fi
