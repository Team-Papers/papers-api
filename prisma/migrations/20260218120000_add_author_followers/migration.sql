-- CreateTable
CREATE TABLE "author_followers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "author_followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "author_followers_author_id_idx" ON "author_followers"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "author_followers_user_id_author_id_key" ON "author_followers"("user_id", "author_id");

-- AddForeignKey
ALTER TABLE "author_followers" ADD CONSTRAINT "author_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author_followers" ADD CONSTRAINT "author_followers_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "author_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
