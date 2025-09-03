-- AlterTable
ALTER TABLE "public"."stores" ADD COLUMN     "type" TEXT DEFAULT 'branch',
ADD COLUMN     "zipCode" TEXT;
