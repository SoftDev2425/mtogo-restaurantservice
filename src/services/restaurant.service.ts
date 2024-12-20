import CategoryBuilder from '../model/category';
import prisma from '../../prisma/client';
import { Prisma } from '@prisma/client';

const DUPLICATE_KEY_ERROR = 'P2002';

async function calculateSortOrder(restaurantId: string) {
  return prisma.categories.count({ where: { restaurantId } });
}

async function createCategory(
  title: string,
  description: string,
  restaurantId: string,
) {
  if (!title || !restaurantId) {
    throw new Error('Title and restaurant ID are required.');
  }
  try {
    // calculate sortOrder
    const sortOrder = await calculateSortOrder(restaurantId);

    // Builder Pattern used to create data object
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
    handleCreateCategoryError(error, 'creating');
  }
}

function handleCreateCategoryError(error: unknown, operation: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === DUPLICATE_KEY_ERROR &&
      (error.meta?.target as string[])?.includes('title')
    ) {
      throw new Error('A category with this title already exists.');
    }
  }
  console.error(`An error occured during ${operation}:`, error);
  throw new Error(`An unexpected error occured while ${operation} the category.`);
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

/**
 * Updates a category in the database
 */
async function updateCategory(
  categoryId: string,
  title: string | undefined,
  description: string | undefined, // Allow description to be optional
  sortOrder: number | undefined,
  restaurantId: string,
) {
  if (!categoryId || !restaurantId) {
    throw new Error('Category ID, title, and restaurant ID are required.');
  }

  const duplicateCategory = await prisma.categories.findFirst({
    where: {
      title,
      restaurantId,
      NOT: { id: categoryId },
    },
  });
  
  if (duplicateCategory) {
    throw new Error('A category with this title already exists.');
  }
  // Fetch existing category to preserve optional fields
  const existingCategory = await prisma.categories.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory || existingCategory.restaurantId !== restaurantId) {
    throw new Error('Category not found or does not belong to the restaurant.');
  }

  // Check for duplicate title if title is provided
  if (title && title !== existingCategory.title) {
    const duplicateCategory = await prisma.categories.findFirst({
      where: {
        title,
        restaurantId,
        NOT: { id: categoryId },
      },
    });
    if (duplicateCategory) {
      throw new Error('A category with this title already exists.');
    }
  }

  try {
     // Adjust sortOrder if it has changed
     if (sortOrder !== undefined && sortOrder !== existingCategory.sortOrder) {
      await prisma.$transaction(async (tx) => {
        await adjustSortOrder(tx, restaurantId, existingCategory.sortOrder, sortOrder);
      });
    }

    // Use builder pattern for the data object
    const categoryData = new CategoryBuilder()
      .setTitle(title ?? existingCategory.title)
      .setDescription(description ?? existingCategory.description ?? '')
      .setSortOrder(sortOrder ?? existingCategory.sortOrder)
      .setRestaurantId(restaurantId)
      .build();

    return await prisma.categories.update({
      where: {
        id: categoryId,
      },
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
    handleCreateCategoryError(error, 'updating');
  }
}

/**
 *
 * @param categoryId
 * @param restaurantId
 */
async function deleteCategory(categoryId: string, restaurantId: string) {
  const category = await prisma.categories.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category || category.restaurantId !== restaurantId) {
    throw new Error('Category not found');
  }

  await prisma.categories.delete({
    where: {
      id: categoryId,
    },
  });
}

async function createMenu(
  title: string,
  description: string,
  price: number,
  categoryId: string,
  restaurantId: string,
) {
  try {
    const category = await prisma.categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category || category.restaurantId !== restaurantId) {
      throw new Error('Category not found');
    }

    return await prisma.menus.create({
      data: {
        title,
        description,
        price,
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('title')
      ) {
        throw new Error('A menu with this title already exists.');
      }
    }
    throw error;
  }
}

async function updateMenu(
  menuId: string,
  title: string,
  description: string,
  price: number,
  restaurantId: string,
) {
  try {
    // validate sortOrder
    const menu = await prisma.menus.findUnique({
      where: {
        id: menuId,
      },
      select: {
        category: {
          select: {
            id: true,
            restaurantId: true,
          },
        },
      },
    });

    if (!menu || menu.category.restaurantId !== restaurantId) {
      throw new Error('Menu not found.');
    }

    return await prisma.menus.update({
      where: {
        id: menuId,
      },
      data: {
        title,
        description,
        price,
      },
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('title')
      ) {
        throw new Error('A menu with this title already exists.');
      }
    }
    throw error;
  }
}

async function deleteMenu(menuId: string, restaurantId: string) {
  try {
    const menu = await prisma.menus.findUnique({
      where: {
        id: menuId,
      },
      select: {
        category: {
          select: {
            id: true,
            restaurantId: true,
          },
        },
      },
    });

    if (!menu || menu.category.restaurantId !== restaurantId) {
      throw new Error('Menu not found.');
    }

    // Delete the menu
    await prisma.menus.delete({
      where: {
        id: menuId,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getMenusByCategoryId(categoryId: string) {
  return await prisma.menus.findMany({
    where: {
      categoryId,
    },
  });
}

// async function getNearbyRestaurants(city: string, zip: string) {
//   // GET CITY AND ZIP X,Y
//   // const { x, y } = await getCityAndZipCoordinates(city, zip);

// }

async function getCategoriesByRestaurantId(restaurantId: string) {
  return await prisma.categories.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      sortOrder: 'asc',
    },
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

// async function getRestaurantDetailsByRestaurantId(restaurantId: string) {

//   return await prisma.restaurants.findUnique({
//     where: {
//       id: restaurantId,
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       phone: true,
//       createdAt: true,
//       address: true,
//       Categories: {
//         select: {
//           id: true,
//           title: true,
//           description: true,
//           sortOrder: true,
//           createdAt: true,
//           menus: {
//             select: {
//               id: true,
//               title: true,
//               description: true,
//               price: true,
//               sortOrder: true,
//               createdAt: true,
//             },
//             orderBy: {
//               sortOrder: 'asc',
//             },
//           },
//         },
//       },
//     },
//   });
// }

async function getCategoryById(categoryId: string) {
  return await prisma.categories.findUnique({
    where: {
      id: categoryId,
    },
  });
}

async function getMenuById(menuId: string) {
  return await prisma.menus.findUnique({
    where: {
      id: menuId,
    },
  });
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
