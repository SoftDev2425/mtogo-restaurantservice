/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,title]` on the table `Menus` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Menus_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "Menus_categoryId_title_key" ON "Menus"("categoryId", "title");
