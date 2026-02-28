-- AlterTable
ALTER TABLE "purchases" ADD COLUMN "phone_number" VARCHAR(20);
ALTER TABLE "purchases" ADD COLUMN "operator" VARCHAR(30);
ALTER TABLE "purchases" ADD COLUMN "failure_code" VARCHAR(50);
ALTER TABLE "purchases" ADD COLUMN "failure_message" TEXT;
