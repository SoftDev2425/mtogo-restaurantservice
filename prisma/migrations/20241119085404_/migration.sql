/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Menu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_categoryId_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Menu";

-- CreateTable
CREATE TABLE "Categories" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menus" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Menus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categories_title_key" ON "Categories"("title");

-- CreateIndex
CREATE INDEX "restaurant_id_index_category" ON "Categories"("restaurantId");

-- CreateIndex
CREATE INDEX "title_index" ON "Categories"("title");

-- CreateIndex
CREATE INDEX "sort_order_index" ON "Categories"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Menus_title_key" ON "Menus"("title");

-- CreateIndex
CREATE INDEX "category_id_index" ON "Menus"("categoryId");

-- CreateIndex
CREATE INDEX "price_index" ON "Menus"("price");

-- CreateIndex
CREATE INDEX "sort_order_index_menu" ON "Menus"("sortOrder");

-- AddForeignKey
ALTER TABLE "Menus" ADD CONSTRAINT "Menus_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
