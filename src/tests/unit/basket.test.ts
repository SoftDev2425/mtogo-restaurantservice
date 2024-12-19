import {
  getBasketById,
  getBasket,
  addToBasket,
  clearBasket,
} from '../../services/basket.service';
import prisma from '../../../prisma/client';
import { faker } from '@faker-js/faker';

describe('getBasketById', () => {
  it('should return a basket if it exists', async () => {
    const basketId = 'basket123';
    const customerId = 'customer123';

    const mockBasket = {
      id: basketId,
      customerId: customerId,
      items: [
        { id: 'item1', quantity: faker.number.int },
        { id: 'item2', quantity: faker.number.int },
      ],
    };

    prisma.basket.findFirst = jest.fn().mockResolvedValue(mockBasket);

    const result = await getBasketById(customerId, basketId);

    expect(result).toEqual(mockBasket);
    // Verify the correct parameters were passed to Prisma Client
    expect(prisma.basket.findFirst).toHaveBeenCalledWith({
      where: {
        customerId: customerId,
        id: basketId,
      },
      include: { items: true },
    });
  });
});

describe('getBasket', () => {
  it('should return a basket if it exists', async () => {
    const customerId = 'customer123';
    const restaurantId = 'restaurant123';

    const mockBasket = {
      id: 'basket123',
      customerId: customerId,
      restaurantId: restaurantId,
      items: [
        { id: 'item1', quantity: faker.number.int() },
        { id: 'item2', quantity: faker.number.int() },
      ],
    };

    prisma.basket.findFirst = jest.fn().mockResolvedValue(mockBasket);

    const result = await getBasket(customerId, restaurantId);

    expect(result).toEqual(mockBasket);
    // Verify the correct parameters were passed to Prisma Client
    expect(prisma.basket.findFirst).toHaveBeenCalledWith({
      where: {
        customerId: customerId,
        restaurantId: restaurantId,
      },
      include: { items: true },
    });
  });

  it('should delete basket and its items if basket is empty', async () => {
    const customerId = 'customer123';
    const restaurantId = 'restaurant123';

    const mockBasket = {
      id: 'basket123',
      customerId: customerId,
      restaurantId: restaurantId,
      items: [],
    };

    prisma.basket.findFirst = jest.fn().mockResolvedValue(mockBasket);
    prisma.basketItems.deleteMany = jest.fn().mockResolvedValue({ count: 0 });
    prisma.basket.delete = jest.fn().mockResolvedValue({});

    const result = await getBasket(customerId, restaurantId);

    // Basket is deleted, should return null
    expect(result).toBeNull();
    // Verify deleteMany for basketItems
    expect(prisma.basketItems.deleteMany).toHaveBeenCalledWith({
      where: { basketId: 'basket123' },
    });
    // Verify delete for basket id
    expect(prisma.basket.delete).toHaveBeenCalledWith({
      where: { id: 'basket123' },
    });
  });

  it('should return null if no basket is found', async () => {
    const customerId = 'customer123';
    const restaurantId = 'restaurant123';

    prisma.basket.findFirst = jest.fn().mockResolvedValue(null);

    const result = await getBasket(customerId, restaurantId);

    // No basket found, should return null
    expect(result).toBeNull();
    // Verify Prisma query parameters
    expect(prisma.basket.findFirst).toHaveBeenCalledWith({
      where: { customerId, restaurantId },
      include: { items: true },
    });
  });
});

describe('addToBasket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should throw an error if the restaurant is not found', async () => {
    const customerId = 'customer123';
    const menuId = 'menu123';
    const title = 'Test Menu Item';
    const quantity = 2;
    const restaurantId = 'restaurant123';

    // Mock the fetch response to simulate a failed restaurant fetch
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await expect(
      addToBasket(customerId, menuId, title, quantity, restaurantId),
    ).rejects.toThrow('Restaurant not found');
  });

  it('should add a new item to the basket', async () => {
    const customerId = 'customer123';
    const menuId = 'menu123';
    const title = faker.food.dish();
    const quantity = faker.number.int();
    const price = faker.number.int();
    const restaurantId = 'restaurant123';
    const basketId = 'basket123';

    const mockRestaurantResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    };
    const mockMenu = { id: menuId, price: price };
    const mockBasket = { id: basketId, customerId, restaurantId };

    // Mock the fetch response for restaurant
    (fetch as jest.Mock).mockResolvedValueOnce(mockRestaurantResponse);

    // Mock Prisma calls
    prisma.menus.findFirst = jest.fn().mockResolvedValue(mockMenu);
    prisma.basket.findFirst = jest.fn().mockResolvedValue(mockBasket);
    prisma.basketItems.create = jest.fn().mockResolvedValue({});

    const result = await addToBasket(
      customerId,
      menuId,
      title,
      quantity,
      restaurantId,
    );

    // Assert basket creation and item addition
    expect(prisma.basketItems.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          basketId: basketId,
          title: title,
          menuId: menuId,
          quantity: quantity,
          price: price,
        },
      }),
    );

    expect(result).toEqual(mockBasket);
  });

  it('should update the quantity of an existing item in the basket', async () => {
    const customerId = 'customer123';
    const menuId = 'menu123';
    const title = faker.food.dish();
    const quantity = faker.number.int({ min: 1 });
    const price = faker.number.int({ min: 1 });
    const restaurantId = 'restaurant123';
    const basketId = 'basket123';
    const itemId = 'item123';

    const mockRestaurantResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    };
    const mockMenu = { id: menuId, price: price };
    const mockBasket = { id: basketId, customerId, restaurantId };
    const mockExistingItem = {
      id: itemId,
      basketId: basketId,
      menuId,
      quantity: quantity,
    };

    // Mock the fetch response for restaurant
    (fetch as jest.Mock).mockResolvedValueOnce(mockRestaurantResponse);

    // Mock Prisma calls
    prisma.menus.findFirst = jest.fn().mockResolvedValue(mockMenu);
    prisma.basket.findFirst = jest.fn().mockResolvedValue(mockBasket);
    prisma.basketItems.findFirst = jest
      .fn()
      .mockResolvedValue(mockExistingItem);
    prisma.basketItems.update = jest.fn().mockResolvedValue({});

    // Call the function
    const result = await addToBasket(
      customerId,
      menuId,
      title,
      quantity,
      restaurantId,
    );

    // Assert basket item update
    expect(prisma.basketItems.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: itemId },
        data: { quantity: quantity, price: price },
      }),
    );

    expect(result).toEqual(mockBasket);
  });

  it('should delete an item from the basket if the quantity is 0 or less for an existing item', async () => {
    const customerId = 'customer123';
    const menuId = 'menu123';
    const title = 'Dish Title';
    const quantity = 0; // Setting the quantity to 0 to trigger deletion
    const price = 10;
    const restaurantId = 'restaurant123';
    const basketId = 'basket123';
    const itemId = 'item123';

    const mockRestaurantResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    };
    const mockMenu = { id: menuId, price: price };
    const mockBasket = { id: basketId, customerId, restaurantId };
    const mockExistingItem = {
      id: itemId,
      basketId: basketId,
      menuId,
      quantity: 2,
    };

    // Mock the fetch response for restaurant
    (fetch as jest.Mock).mockResolvedValueOnce(mockRestaurantResponse);

    // Mock Prisma calls
    prisma.menus.findFirst = jest.fn().mockResolvedValue(mockMenu);
    prisma.basket.findFirst = jest.fn().mockResolvedValue(mockBasket);
    prisma.basketItems.findFirst = jest
      .fn()
      .mockResolvedValue(mockExistingItem);
    prisma.basketItems.delete = jest.fn().mockResolvedValue({});

    const result = await addToBasket(
      customerId,
      menuId,
      title,
      quantity,
      restaurantId,
    );

    // Assert that the item was deleted from the basket
    expect(prisma.basketItems.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: itemId,
        },
      }),
    );

    expect(result).toEqual(mockBasket);
  });
});

describe('clearBasket', () => {
  const customerId = 'customer-id';
  const basketId = 'basket-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if basket is not found', async () => {
    // Mock the prisma.basket.findFirst to return null (basket not found)
    (prisma.basket.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(clearBasket(customerId, basketId)).rejects.toThrow(
      'Basket not found',
    );
  });

  it('should perform both delete operations inside a transaction', async () => {
    const basket = { id: basketId, customerId };
    // Mock prisma.basket.findFirst to return a basket
    (prisma.basket.findFirst as jest.Mock).mockResolvedValue(basket);

    // Mock the transaction
    const transactionSpy = jest
      .spyOn(prisma, '$transaction')
      .mockResolvedValueOnce([{}]);

    // Call the function
    await clearBasket(customerId, basketId);

    // Ensure that the transaction was called with both delete operations
    expect(transactionSpy).toHaveBeenCalledWith([
      prisma.basketItems.deleteMany({ where: { basketId: basket.id } }),
      prisma.basket.delete({ where: { id: basket.id } }),
    ]);
  });
});
