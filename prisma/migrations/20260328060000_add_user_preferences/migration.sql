ALTER TABLE "users" ADD COLUMN "age_group" VARCHAR(50);
ALTER TABLE "users" ADD COLUMN "country" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN "books_last_year" VARCHAR(50);
ALTER TABLE "users" ADD COLUMN "reading_barriers" TEXT[] DEFAULT '{}';
ALTER TABLE "users" ADD COLUMN "papers_help" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN "reading_goal" INTEGER;
