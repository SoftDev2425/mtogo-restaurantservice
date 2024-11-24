import prisma from '../../prisma/client';

async function getBasket(customerId: string, restaurantId: string) {
  return await prisma.basket.findFirst({
    where: {
      customerId,
      restaurantId,
    },
    include: {
      items: true,
    },
  });
}

async function addToBasket(
  customerId: string,
  menuId: string,
  quantity: number,
  price: number,
  restaurantId: string,
) {
  let basket = await prisma.basket.findFirst({
    where: {
      customerId,
      restaurantId,
    },
  });

  if (!basket) {
    basket = await prisma.basket.create({
      data: {
        customerId,
        restaurantId,
      },
    });
  }

  const existingMenu = await prisma.basketItems.findFirst({
    where: {
      basketId: basket.id,
      menuId,
    },
  });

  if (existingMenu) {
    await prisma.basketItems.update({
      where: {
        id: existingMenu.id,
      },
      data: {
        quantity,
      },
    });
  } else {
    await prisma.basketItems.create({
      data: {
        basketId: basket.id,
        menuId,
        quantity,
        price,
      },
    });
  }

  return await getBasket(customerId, restaurantId);
}

async function updateBasketItem(
  customerId: string,
  itemId: string,
  quantity: number,
  price: number,
  restaurantId: string,
) {
  const basket = await prisma.basket.findFirst({
    where: {
      customerId,
      restaurantId,
    },
  });

  if (!basket) {
    throw new Error('Basket not found');
  }

  if (quantity <= 0) {
    await prisma.basketItems.delete({
      where: {
        id: itemId,
      },
    });
  } else {
    await prisma.basketItems.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
        price,
      },
    });
  }

  const updatedBasket = await getBasket(customerId, restaurantId);

  if (updatedBasket?.items.length === 0) {
    await clearBasket(customerId, restaurantId);
  }
  return updatedBasket;
}

async function clearBasket(customerId: string, restaurantId: string) {
  const basket = await prisma.basket.findFirst({
    where: {
      customerId,
      restaurantId,
    },
  });

  if (!basket) {
    throw new Error('Basket not found');
  }

  await prisma.basketItems.deleteMany({
    where: { basketId: basket.id },
  });

  await prisma.basket.delete({
    where: { id: basket.id },
  });
}

async function checkout(customerId: string, restaurantId: string) {
  console.log('Checkout', customerId, restaurantId);
}

export {
  getBasket,
  addToBasket,
  updateBasketItem,
  clearBasket,
  checkout,
};
