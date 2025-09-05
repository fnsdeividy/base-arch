-- CreateEnum
CREATE TYPE "public"."Unit" AS ENUM ('g', 'kg', 'ml', 'L', 'un');

-- CreateEnum
CREATE TYPE "public"."CostingMethod" AS ENUM ('fifo', 'wac');

-- CreateEnum
CREATE TYPE "public"."BatchStatus" AS ENUM ('available', 'reserved', 'consumed');

-- CreateEnum
CREATE TYPE "public"."ProductionOrderStatus" AS ENUM ('draft', 'in_progress', 'finished', 'canceled');

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "base_unit" "public"."Unit",
ADD COLUMN     "output_unit" "public"."Unit",
ADD COLUMN     "output_unit_size" DECIMAL(10,3);

-- CreateTable
CREATE TABLE "public"."materials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "base_unit" "public"."Unit" NOT NULL,
    "density_g_per_ml" DECIMAL(8,4),
    "sku" TEXT,
    "min_stock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."material_batches" (
    "id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "qty" DECIMAL(12,3) NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "unit_cost" DECIMAL(10,4) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "supplier" TEXT,
    "lot_code" TEXT,
    "expiry_date" DATE,
    "received_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."BatchStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_bom" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "qty" DECIMAL(10,3) NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "waste_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_bom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."production_orders" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "planned_output_qty" DECIMAL(10,3) NOT NULL,
    "planned_unit" "public"."Unit" NOT NULL,
    "actual_output_qty" DECIMAL(10,3),
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "status" "public"."ProductionOrderStatus" NOT NULL DEFAULT 'draft',
    "costing_method_snapshot" "public"."CostingMethod" NOT NULL,
    "overhead_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "packaging_cost_per_output_unit" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "total_material_cost" DECIMAL(12,2),
    "total_packaging_cost" DECIMAL(12,2),
    "total_overhead_cost" DECIMAL(12,2),
    "total_cost" DECIMAL(12,2),
    "unit_cost" DECIMAL(10,4),
    "batch_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."production_consumptions" (
    "id" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "qty" DECIMAL(12,3) NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "unit_cost_applied" DECIMAL(10,4) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_conversions" (
    "id" TEXT NOT NULL,
    "material_id" TEXT,
    "from_unit" "public"."Unit" NOT NULL,
    "to_unit" "public"."Unit" NOT NULL,
    "factor" DECIMAL(12,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."finished_goods_inventory" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "qty" DECIMAL(12,3) NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "unit_cost" DECIMAL(10,4) NOT NULL,
    "batch_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finished_goods_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_cost_cache" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "last_calculated_at" TIMESTAMP(3) NOT NULL,
    "unit_cost" DECIMAL(10,4) NOT NULL,
    "method" "public"."CostingMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_cost_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "materials_sku_key" ON "public"."materials"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_bom_product_id_material_id_key" ON "public"."product_bom"("product_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "unit_conversions_material_id_from_unit_to_unit_key" ON "public"."unit_conversions"("material_id", "from_unit", "to_unit");

-- CreateIndex
CREATE UNIQUE INDEX "product_cost_cache_product_id_key" ON "public"."product_cost_cache"("product_id");

-- AddForeignKey
ALTER TABLE "public"."material_batches" ADD CONSTRAINT "material_batches_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_bom" ADD CONSTRAINT "product_bom_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_bom" ADD CONSTRAINT "product_bom_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_orders" ADD CONSTRAINT "production_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_consumptions" ADD CONSTRAINT "production_consumptions_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "public"."production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_consumptions" ADD CONSTRAINT "production_consumptions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_consumptions" ADD CONSTRAINT "production_consumptions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."material_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_conversions" ADD CONSTRAINT "unit_conversions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."finished_goods_inventory" ADD CONSTRAINT "finished_goods_inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."finished_goods_inventory" ADD CONSTRAINT "finished_goods_inventory_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "public"."production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_cost_cache" ADD CONSTRAINT "product_cost_cache_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
