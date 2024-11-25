-- CreateTable
CREATE TABLE "Basket" (
    "id" TEXT NOT NULL,
    "customerId" VARCHAR(255) NOT NULL,
    "restaurantId" VARCHAR(255) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Basket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BasketItems" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "menuId" VARCHAR(255) NOT NULL,
    "basketId" TEXT NOT NULL,

    CONSTRAINT "BasketItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_id_index_basket" ON "Basket"("customerId");

-- CreateIndex
CREATE INDEX "restaurant_id_index_basket" ON "Basket"("restaurantId");

-- AddForeignKey
ALTER TABLE "BasketItems" ADD CONSTRAINT "BasketItems_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasketItems" ADD CONSTRAINT "BasketItems_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "Basket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
