import prisma from '../../prisma/client';

export default class PrismaQueryFactory {
  static getCategoryById(categoryId: string) {
    return prisma.categories.findUnique({ where: { id: categoryId } });
  }

  static getMenuById(menuId: string) {
    return prisma.menus.findUnique({ where: { id: menuId } });
  }

  static getCategoriesByRestaurantId(restaurantId: string) {
    return prisma.categories.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        restaurantId: true,
        sortOrder: true,
        createdAt: true,
        menus: true,
      },
    });
  }

  static getMenusByCategoryId(categoryId: string) {
    return prisma.menus.findMany({ where: { categoryId } });
  }
}
