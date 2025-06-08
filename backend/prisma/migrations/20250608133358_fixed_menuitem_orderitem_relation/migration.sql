/*
  Warnings:

  - You are about to alter the column `price` on the `MenuItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `priceChange` on the `Modifier` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `subtotal` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `taxRate` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(4,3)`.
  - You are about to alter the column `taxAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `unitPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `totalPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `currentOrderTotal` on the `Table` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the `PrinterConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `selectedModifiers` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "defaultPrinterRole" "PrinterRole",
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Modifier" ALTER COLUMN "priceChange" DROP DEFAULT,
ALTER COLUMN "priceChange" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxRate" DROP DEFAULT,
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(4,3),
ALTER COLUMN "taxAmount" DROP DEFAULT,
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalAmount" DROP DEFAULT,
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "selectedModifiers" SET NOT NULL;

-- AlterTable
ALTER TABLE "Table" ALTER COLUMN "currentOrderTotal" SET DATA TYPE DECIMAL(10,2);

-- DropTable
DROP TABLE "PrinterConfiguration";

-- DropEnum
DROP TYPE "PrinterConnectionType";

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
