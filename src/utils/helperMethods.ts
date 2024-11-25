import prisma from '../../prisma/client';
import { faker } from '@faker-js/faker';

export const setTestHeaders = ({
  role,
  userId,
  email,
}: {
  role: 'CUSTOMER' | 'RESTAURANT' | 'ADMIN';
  userId?: string;
  email?: string;
}) => {
  return {
    'x-user-role': role,
    'x-user-id': userId || 'test-user-id',
    'x-user-email': email || 'test-user@example.com',
  };
};

export const createTestCustomer = async () => {};

export const createTestRestaurant = async () => {};

export const createTestMenu = async () => {
  return {
    id: 'menuId',
    title: 'menuTitle',
    description: 'menuDescription',
    price: 10,
    sortOrder: 1,
    createdAt: new Date(),
  };
};

export const createTestCategory = async () => {
  return await prisma.categories.create({
    data: {
      title: faker.lorem.word(20),
      description: faker.food.description(),
      sortOrder: 0,
      restaurantId: 'restaurant-user-id',
    },
  });
};
