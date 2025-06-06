/*
  Warnings:

  - You are about to drop the column `modifierGroupId` on the `Modifier` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `DeliveryPlatform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModifierGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItemModifier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestaurantSetting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Modifier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Modifier" DROP CONSTRAINT "Modifier_modifierGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_tableId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemModifier" DROP CONSTRAINT "OrderItemModifier_modifierId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemModifier" DROP CONSTRAINT "OrderItemModifier_orderItemId_fkey";

-- DropIndex
DROP INDEX "MenuItem_name_idx";

-- DropIndex
DROP INDEX "Modifier_modifierGroupId_idx";

-- DropIndex
DROP INDEX "Order_createdAt_idx";

-- DropIndex
DROP INDEX "Order_status_idx";

-- DropIndex
DROP INDEX "Order_tableId_idx";

-- DropIndex
DROP INDEX "Table_status_idx";

-- AlterTable
ALTER TABLE "Modifier" DROP COLUMN "modifierGroupId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "completedAt";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "selectedModifiers" JSONB;

-- DropTable
DROP TABLE "DeliveryPlatform";

-- DropTable
DROP TABLE "ModifierGroup";

-- DropTable
DROP TABLE "OrderItemModifier";

-- DropTable
DROP TABLE "RestaurantSetting";

-- CreateIndex
CREATE UNIQUE INDEX "Modifier_name_key" ON "Modifier"("name");
