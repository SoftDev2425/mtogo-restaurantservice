import CategoryBuilder from '../model/category';
import prisma from '../../prisma/client';
import { Prisma } from '@prisma/client';

/**
 *
 * @param title
 * @param description
 * @param restaurantId
 * @returns created category
 */

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
    handleCreateCategoryError(error);
  }
}

function handleCreateCategoryError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === DUPLICATE_KEY_ERROR) {
      throw new Error('A category with this title already exists.');
    }
  }
  console.error('An error occured:', error);
  throw new Error('An unexpected error occured while creating the category.');
}

/**
 *
 * @returns all categories
 */

async function updateCategory(
  categoryId: string,
  title: string,
  description: string,
  sortOrder: number,
  restaurantId: string,
) {
  try {
    // validate sortOrder
    const category = await prisma.categories.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        restaurantId: true,
        sortOrder: true,
      },
    });

    if (!category || category.restaurantId !== restaurantId) {
      throw new Error('Category not found');
    }

    // Handle sortOrder update if it has changed
    if (sortOrder !== category.sortOrder) {
      // const categoryCount = await prisma.categories.count({
      //   where: { restaurantId },
      // });

      // if (sortOrder < 0 || sortOrder >= categoryCount) {
      //   throw new Error('Invalid sortOrder');
      // }

      // Adjust sortOrder for other categories
      await prisma.$transaction(async prisma => {
        if (sortOrder > category.sortOrder) {
          // Decrement sortOrder for categories between current and new position
          await prisma.categories.updateMany({
            where: {
              restaurantId,
              sortOrder: { gt: category.sortOrder, lte: sortOrder },
            },
            data: { sortOrder: { decrement: 1 } },
          });
        } else if (sortOrder < category.sortOrder) {
          // Increment sortOrder for categories between new and current position
          await prisma.categories.updateMany({
            where: {
              restaurantId,
              sortOrder: { gte: sortOrder, lt: category.sortOrder },
            },
            data: { sortOrder: { increment: 1 } },
          });
        }
      });
    }

    return await prisma.categories.update({
      where: {
        id: categoryId,
      },
      data: {
        title,
        description,
        sortOrder,
      },
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('title')
      ) {
        throw new Error('A category with this title already exists.');
      }
    }
    throw error;
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
