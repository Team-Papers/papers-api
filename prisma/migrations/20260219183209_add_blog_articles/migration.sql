-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "author_followers" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "collections" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "favorites" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" VARCHAR(500),
    "cover_url" VARCHAR(500),
    "category" VARCHAR(100),
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_likes" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "article_likes_user_id_idx" ON "article_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "article_likes_article_id_user_id_key" ON "article_likes"("article_id", "user_id");

-- AddForeignKey
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
