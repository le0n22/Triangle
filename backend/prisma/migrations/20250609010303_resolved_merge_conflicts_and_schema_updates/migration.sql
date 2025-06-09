/*
  Warnings:

  - You are about to drop the column `defaultPrinterRoleId` on the `MenuCategory` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuCategory" DROP CONSTRAINT "MenuCategory_defaultPrinterRoleId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "defaultPrinterRoleId";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,4);

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
