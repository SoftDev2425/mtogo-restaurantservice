import prisma from '../../prisma/client';

async function getBasketById(customerId: string, basketId: string) {
  return await prisma.basket.findFirst({
    where: {
      customerId,
      id: basketId,
    },
    include: {
      items: true,
    },
  });
}

async function getBasket(customerId: string, restaurantId: string) {
  const basket = await prisma.basket.findFirst({
    where: {
      customerId,
      restaurantId,
    },
    include: {
      items: true,
    },
  });

  if (basket && basket?.items && basket.items.length === 0) {
    await prisma.basketItems.deleteMany({
      where: {
        basketId: basket.id,
      },
    });

    await prisma.basket.delete({
      where: {
        id: basket.id,
      },
    });

    return null;
  }

  return basket;
}

async function addToBasket(
  customerId: string,
  menuId: string,
  title: string,
  quantity: number,
  price: number,
  restaurantId: string,
) {
  const restaurant = await fetch(
    `${process.env.AUTH_SERVICE_URL}/api/restaurants/${restaurantId}`,
  );

  if (!restaurant.ok) {
    throw new Error('Restaurant not found');
  }

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
    if (quantity > 0) {
      await prisma.basketItems.update({
        where: {
          id: existingMenu.id,
        },
        data: {
          quantity,
          price,
        },
      });
    } else {
      await prisma.basketItems.delete({
        where: {
          id: existingMenu.id,
        },
      });
    }
  } else {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0 for a new item');
    }

    await prisma.basketItems.create({
      data: {
        basketId: basket.id,
        title,
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

  await prisma.$transaction([
    prisma.basketItems.deleteMany({
      where: { basketId: basket.id },
    }),
    prisma.basket.delete({
      where: { id: basket.id },
    }),
  ]);
}

async function checkout(customerId: string, restaurantId: string) {
  console.log('Checkout', customerId, restaurantId);
}

export {
  getBasketById,
  getBasket,
  addToBasket,
  updateBasketItem,
  clearBasket,
  checkout,
};
