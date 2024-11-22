/*
  Warnings:

  - You are about to drop the column `sortOrder` on the `Menus` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "sort_order_index_menu";

-- AlterTable
ALTER TABLE "Menus" DROP COLUMN "sortOrder";
