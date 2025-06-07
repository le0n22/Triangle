/*
  Warnings:

  - You are about to alter the column `taxRate` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,2)` to `Decimal(5,4)`.
  - You are about to alter the column `currentOrderTotal` on the `Table` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `_MenuItemAvailableModifiers` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `selectedModifiers` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PrinterConnectionType" AS ENUM ('NETWORK', 'BLUETOOTH', 'USB', 'OTHER');

-- CreateEnum
CREATE TYPE "PrinterRole" AS ENUM ('KITCHEN_KOT', 'BAR_KOT', 'RECEIPT', 'REPORT');

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemAvailableModifiers" DROP CONSTRAINT "_MenuItemAvailableModifiers_A_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemAvailableModifiers" DROP CONSTRAINT "_MenuItemAvailableModifiers_B_fkey";

-- DropIndex
DROP INDEX "Table_currentOrderId_key";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "taxRate" DROP DEFAULT,
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,4);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "selectedModifiers" SET NOT NULL;

-- AlterTable
ALTER TABLE "Table" ALTER COLUMN "currentOrderTotal" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "_MenuItemAvailableModifiers";

-- CreateTable
CREATE TABLE "PrinterConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "connectionType" "PrinterConnectionType" NOT NULL,
    "connectionInfo" TEXT NOT NULL,
    "roles" "PrinterRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrinterConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuItemModifiers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MenuItemModifiers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrinterConfiguration_name_key" ON "PrinterConfiguration"("name");

-- CreateIndex
CREATE INDEX "_MenuItemModifiers_B_index" ON "_MenuItemModifiers"("B");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemModifiers" ADD CONSTRAINT "_MenuItemModifiers_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemModifiers" ADD CONSTRAINT "_MenuItemModifiers_B_fkey" FOREIGN KEY ("B") REFERENCES "Modifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
