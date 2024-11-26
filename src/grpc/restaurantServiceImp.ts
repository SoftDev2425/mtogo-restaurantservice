import prisma from '../../prisma/client';
import { producer } from '../config/kafka.config';

// gRPC service implementation
export const restaurantServiceImpl = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRestaurantDetails: async (call: any, callback: any) => {
    try {
      const { id } = call.request;
      console.log(id);
      const response = {
        name: 'Pizza Palace',
        address: '123 Main Street',
        rating: 4.5,
      };
      callback(null, response);
    } catch (error) {
      callback(error, null);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createCategory: async (call: any, callback: any) => {
    try {
      const { title, description } = call.request;
      const category = await prisma.categories.create({
        data: {
          title,
          description,
          sortOrder: 0,
          restaurantId: call.metadata.get('restaurant_id'), // ?????
        },
      });
      // Produce an event to Kafka
      await producer.send({
        topic: 'category-created',
        messages: [{ value: JSON.stringify(category) }],
      });
      callback(null, category);
    } catch (error) {
      callback(error, null);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCategory: async (call: any, callback: any) => {
    try {
      const { id, title, description, sortOrder } = call.request;
      const category = await prisma.categories.update({
        where: { id },
        data: { title, description, sortOrder },
      });

      callback(null, category);
    } catch (error) {
      callback(error, null);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteCategory: async (call: any, callback: any) => {
    try {
      const { id } = call.request;
      await prisma.categories.delete({ where: { id } });
      callback(null, { success: true });
    } catch (error) {
      callback(error, null);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMenu: async (call: any, callback: any) => {
    try {
      const { id } = call.request;
      const menu = await prisma.menus.findUnique({ where: { id } });
      callback(null, menu);
    } catch (error) {
      callback(error, null);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateMenu: async (call: any, callback: any) => {
    try {
      const { id, title } = call.request;
      const menu = await prisma.menus.update({
        where: { id },
        data: { title },
      });
      callback(null, menu);
    } catch (error) {
      callback(error, null);
    }
  },
};
