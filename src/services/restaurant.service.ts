import CategoryBuilder from '../model/category';
import prisma from '../../prisma/client';
import { Prisma } from '@prisma/client';

const DUPLICATE_KEY_ERROR = 'P2002';

/** Utility Functions */
async function calculateSortOrder(restaurantId: string) {
  return prisma.categories.count({ where: { restaurantId } });
}

function handlePrismaError(error: unknown, operation: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (
      error.code === DUPLICATE_KEY_ERROR &&
      (error.meta?.target as string[])?.includes('title')
    ) {
      throw new Error(
        `Could not ${operation} with this title because title already exists.`,
      );
    }
  }
  console.error(`An error occured during ${operation}:`, error);
  throw new Error(`An unexpected error occured while ${operation}.`);
}

async function fetchCategory(categoryId: string, restaurantId: string) {
  const category = await prisma.categories.findUnique({
    where: { id: categoryId },
  });
  if (!category || category.restaurantId !== restaurantId) {
    throw new Error('Category not found or does not belong to the restaurant.');
  }
  return category;
}

async function fetchMenu(menuId: string, restaurantId: string) {
  const menu = await prisma.menus.findUnique({
    where: { id: menuId },
    select: { category: { select: { restaurantId: true } } },
  });
  if (!menu || menu.category.restaurantId !== restaurantId) {
    throw new Error('Menu not found or does not belong to the restaurant.');
  }
  return menu;
}

/**
 * Handles sortOrder adjustment within a transaction
 */
async function adjustSortOrder(
  transactionClient: Prisma.TransactionClient,
  restaurantId: string,
  currentSortOrder: number,
  newSortOrder: number,
) {
  if (newSortOrder > currentSortOrder) {
    // Decrement sortOrder for categories between current and new position
    await transactionClient.categories.updateMany({
      where: {
        restaurantId,
        sortOrder: { gt: currentSortOrder, lte: newSortOrder },
      },
      data: { sortOrder: { decrement: 1 } },
    });
  } else if (newSortOrder < currentSortOrder) {
    // Increment sortOrder for categories between new and current position
    await transactionClient.categories.updateMany({
      where: {
        restaurantId,
        sortOrder: { gte: newSortOrder, lt: currentSortOrder },
      },
      data: { sortOrder: { increment: 1 } },
    });
  }
}

/** Category Management */
async function createCategory(
  title: string,
  description: string,
  restaurantId: string,
) {
  if (!title || !restaurantId) {
    throw new Error('Title and restaurant ID are required.');
  }
  try {
    const sortOrder = await calculateSortOrder(restaurantId);
    const categoryData = new CategoryBuilder()
      .setTitle(title)
      .setDescription(description)
      .setRestaurantId(restaurantId)
      .setSortOrder(sortOrder)
      .build();

    return await prisma.categories.create({
      data: categoryData,
      select: {
        id: true,
        title: true,
        sortOrder: true,
        description: true,
        menus: true,
        updatedAt: true,
        createdAt: true,
      },
    });
  } catch (error) {
    handlePrismaError(error, 'creating category');
  }
}

async function updateCategory(
  categoryId: string,
  title: string,
  description: string,
  sortOrder: number,
  restaurantId: string,
) {
  if (!categoryId || !restaurantId) {
    throw new Error('Category ID and restaurant ID are required.');
  }

  const existingCategory = await fetchCategory(categoryId, restaurantId);

  if (title && title !== existingCategory.title) {
    const duplicateCategory = await prisma.categories.findFirst({
      where: { title, restaurantId, NOT: { id: categoryId } },
    });
    if (duplicateCategory) {
      throw new Error('A category with this title already exists.');
    }
  }

  try {
    if (sortOrder !== undefined && sortOrder !== existingCategory.sortOrder) {
      await prisma.$transaction(async tx => {
        await adjustSortOrder(
          tx,
          restaurantId,
          existingCategory.sortOrder,
          sortOrder,
        );
      });
    }

    const categoryData = new CategoryBuilder()
      .setTitle(title ?? existingCategory.title) // Preserve existing title if not provided
      .setDescription(description ?? existingCategory.description) // Preserve existing description
      .setSortOrder(sortOrder ?? existingCategory.sortOrder) // Preserve existing sortOrder
      .setRestaurantId(restaurantId)
      .build();

    return await prisma.categories.update({
      where: { id: categoryId },
      data: categoryData,
      select: {
        id: true,
        title: true,
        description: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    handlePrismaError(error, 'updating category');
  }
}

async function deleteCategory(categoryId: string, restaurantId: string) {
  const category = await fetchCategory(categoryId, restaurantId);
  await prisma.categories.delete({ where: { id: category.id } });
}

/** Menu Management */
async function createMenu(
  title: string,
  description: string,
  price: number,
  categoryId: string,
  restaurantId: string,
) {
  const category = await fetchCategory(categoryId, restaurantId);

  try {
    return await prisma.menus.create({
      data: {
        title,
        description,
        price,
        category: { connect: { id: category.id } },
      },
    });
  } catch (error) {
    handlePrismaError(error, 'creating menu');
  }
}

async function updateMenu(
  menuId: string,
  title: string,
  description: string,
  price: number,
  restaurantId: string,
) {
  await fetchMenu(menuId, restaurantId);

  try {
    return await prisma.menus.update({
      where: { id: menuId },
      data: { title, description, price },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    handlePrismaError(error, 'updating menu');
  }
}

async function deleteMenu(menuId: string, restaurantId: string) {
  await fetchMenu(menuId, restaurantId);
  await prisma.menus.delete({ where: { id: menuId } });
}

/** Query Functions */
async function getMenusByCategoryId(categoryId: string) {
  return prisma.menus.findMany({ where: { categoryId } });
}

async function getCategoriesByRestaurantId(restaurantId: string) {
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

async function getCategoryById(categoryId: string) {
  return prisma.categories.findUnique({ where: { id: categoryId } });
}

async function getMenuById(menuId: string) {
  return prisma.menus.findUnique({ where: { id: menuId } });
}

async function getRestaurantDetailsByRestaurantId(restaurantId: string) {
  const restaurantData = await fetch(
    `${process.env.AUTH_SERVICE_URL}/api/restaurants/${restaurantId}`,
  );

  const restaurant = (await restaurantData.json()) as {
    restaurant: {
      id: string;
      name: string;
      email: string;
      phone: string;
      createdAt: Date;
      address: {
        street: string;
        city: string;
        state: string;
        zip: string;
      };
    };
  };

  const categories = await getCategoriesByRestaurantId(restaurantId);

  return {
    id: restaurant.restaurant.id,
    name: restaurant.restaurant.name,
    email: restaurant.restaurant.email,
    phone: restaurant.restaurant.phone,
    createdAt: restaurant.restaurant.createdAt,
    address: restaurant.restaurant.address,
    categories,
  };
}

export {
  createCategory,
  updateCategory,
  deleteCategory,
  createMenu,
  getMenusByCategoryId,
  updateMenu,
  deleteMenu,
  getRestaurantDetailsByRestaurantId,
  getCategoriesByRestaurantId,
  getMenuById,
  getCategoryById,
};
