import prisma from '../../prisma/client';
import { producer } from '../config/kafka.config';

// gRPC service implementation
export const restaurantServiceImpl = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createCategory: async (call: any, callback: any) => {
    try {
      const { name, sortOrder } = call.request;
      const category = await prisma.category.create({
        data: { name, sortOrder },
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
      const { id, name, sortOrder } = call.request;
      const category = await prisma.category.update({
        where: { id },
        data: { name, sortOrder },
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
      await prisma.category.delete({ where: { id } });
      callback(null, { success: true });
    } catch (error) {
      callback(error, null);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMenu: async (call: any, callback: any) => {
    try {
      const { id } = call.request;
      const menu = await prisma.menu.findUnique({ where: { id } });
      callback(null, menu);
    } catch (error) {
      callback(error, null);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateMenu: async (call: any, callback: any) => {
    try {
      const { id, title } = call.request;
      const menu = await prisma.menu.update({ where: { id }, data: { title } });
      callback(null, menu);
    } catch (error) {
      callback(error, null);
    }
  },
};
