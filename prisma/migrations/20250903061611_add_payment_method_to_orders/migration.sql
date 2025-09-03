/*
  Warnings:

  - You are about to drop the column `country` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_number` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `tax_amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `tax_amount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `store_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the `stocks` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNumber` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_store_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."stocks" DROP CONSTRAINT "stocks_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."stocks" DROP CONSTRAINT "stocks_store_id_fkey";

-- DropIndex
DROP INDEX "public"."invoices_invoice_number_key";

-- AlterTable
ALTER TABLE "public"."audit_logs" ALTER COLUMN "action" SET DATA TYPE TEXT,
ALTER COLUMN "resource_type" SET DATA TYPE TEXT,
ALTER COLUMN "resource_id" SET DATA TYPE TEXT,
ALTER COLUMN "ip_address" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."customers" DROP COLUMN "country",
ADD COLUMN     "birth_date" DATE,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "state" SET DATA TYPE TEXT,
ALTER COLUMN "zip_code" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."invoices" DROP COLUMN "created_at",
DROP COLUMN "customer_id",
DROP COLUMN "due_date",
DROP COLUMN "invoice_number",
DROP COLUMN "order_id",
DROP COLUMN "tax_amount",
DROP COLUMN "total_amount",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "invoiceNumber" TEXT NOT NULL,
ADD COLUMN     "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "taxAmount" DECIMAL(10,2),
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft',
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."order_items" DROP COLUMN "created_at",
DROP COLUMN "order_id",
DROP COLUMN "product_id",
DROP COLUMN "unit_price",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "unitPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "tax_amount",
DROP COLUMN "total_amount",
ADD COLUMN     "payment_method" TEXT NOT NULL DEFAULT 'cash',
ADD COLUMN     "tax" DECIMAL(10,2),
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "order_number" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."permissions" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "resource" SET DATA TYPE TEXT,
ALTER COLUMN "action" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "cost",
DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "store_id",
DROP COLUMN "updated_at",
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "costPrice" DECIMAL(10,2),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "sku" SET DATA TYPE TEXT,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "brand" SET DATA TYPE TEXT,
ALTER COLUMN "dimensions" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."role_permissions" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."roles" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."sessions" ALTER COLUMN "refresh_token_hash" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "ip_address" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."stores" DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "updated_at",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."user_roles" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."stocks";

-- CreateTable
CREATE TABLE "public"."stock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 0,
    "maxQuantity" INTEGER,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_transactions" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "storeId" TEXT,
    "userId" TEXT NOT NULL,
    "attachments" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_productId_storeId_key" ON "public"."stock"("productId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "public"."products"("barcode");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock" ADD CONSTRAINT "stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock" ADD CONSTRAINT "stock_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transactions" ADD CONSTRAINT "stock_transactions_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
