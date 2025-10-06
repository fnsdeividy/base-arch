/*
  Warnings:

  - The `type` column on the `stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."StoreType" AS ENUM ('main', 'branch', 'kiosk');

-- AlterTable
ALTER TABLE "public"."stores" DROP COLUMN "type",
ADD COLUMN     "type" "public"."StoreType" NOT NULL DEFAULT 'branch';
