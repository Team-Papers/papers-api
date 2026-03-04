-- CreateTable
CREATE TABLE "article_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" VARCHAR(500) NOT NULL,
    "article_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_comments_article_id_idx" ON "article_comments"("article_id");

-- CreateIndex
CREATE INDEX "article_comments_user_id_idx" ON "article_comments"("user_id");

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
