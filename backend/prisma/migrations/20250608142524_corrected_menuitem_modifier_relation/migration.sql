/*
  Warnings:

  - You are about to drop the column `defaultPrinterRole` on the `MenuCategory` table. All the data in the column will be lost.
  - You are about to drop the column `defaultPrinterRole` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the `_MenuItemModifiers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'STAFF', 'MANAGER');

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemModifiers" DROP CONSTRAINT "_MenuItemModifiers_A_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemModifiers" DROP CONSTRAINT "_MenuItemModifiers_B_fkey";

-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "defaultPrinterRole",
ADD COLUMN     "defaultPrinterRoleId" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "defaultPrinterRole",
ADD COLUMN     "defaultPrinterRoleId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "selectedModifiers" DROP NOT NULL;

-- DropTable
DROP TABLE "_MenuItemModifiers";

-- DropEnum
DROP TYPE "PrinterRole";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterRoleDefinition" (
    "id" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrinterRoleDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuItemAvailableModifiers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MenuItemAvailableModifiers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterRoleDefinition_roleKey_key" ON "PrinterRoleDefinition"("roleKey");

-- CreateIndex
CREATE INDEX "_MenuItemAvailableModifiers_B_index" ON "_MenuItemAvailableModifiers"("B");

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_defaultPrinterRoleId_fkey" FOREIGN KEY ("defaultPrinterRoleId") REFERENCES "PrinterRoleDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_defaultPrinterRoleId_fkey" FOREIGN KEY ("defaultPrinterRoleId") REFERENCES "PrinterRoleDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemAvailableModifiers" ADD CONSTRAINT "_MenuItemAvailableModifiers_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemAvailableModifiers" ADD CONSTRAINT "_MenuItemAvailableModifiers_B_fkey" FOREIGN KEY ("B") REFERENCES "Modifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
