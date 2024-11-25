/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,title]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Categories_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "Categories_restaurantId_title_key" ON "Categories"("restaurantId", "title");
