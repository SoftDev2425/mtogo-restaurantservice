import prisma from '../../prisma/client';
import { Prisma } from '@prisma/client';

/**
 *
 * @param title
 * @param description
 * @param restaurantId
 * @returns created category
 */
async function createCategory(
  title: string,
  description: string,
  restaurantId: string,
) {
  try {
    // calculate sortOrder
    const categoryCount = await prisma.categories.count({
      where: {
        restaurantId,
      },
    });

    return await prisma.categories.create({
      data: {
        title,
        description,
        restaurantId,
        sortOrder: categoryCount,
      },
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

    console.log(category);

    if (!category || category.restaurantId !== restaurantId) {
      throw new Error('Category not found');
    }

    console.log('category found');
    console.log(category.restaurantId, restaurantId);

    const menusCount = await prisma.menus.count({
      where: {
        categoryId,
      },
    });

    return await prisma.menus.create({
      data: {
        title,
        description,
        price,
        sortOrder: menusCount,
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

async function getMenusByCategoryId(categoryId: string) {
  return await prisma.menus.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });
}

async function updateMenu(
  menuId: string,
  title: string,
  description: string,
  price: number,
  sortOrder: number,
  restaurantId: string,
) {
  try {
    // validate sortOrder
    const menu = await prisma.menus.findUnique({
      where: {
        id: menuId,
      },
      select: {
        sortOrder: true,
        category: {
          select: {
            id: true,
            restaurantId: true,
          },
        },
      },
    });

    if (!menu || menu.category.restaurantId !== restaurantId) {
      throw new Error('Menu not found');
    }

    if (sortOrder !== menu.sortOrder) {
      const menus = await prisma.menus.findMany({
        where: {
          categoryId: menu.category.id,
        },
        orderBy: {
          sortOrder: 'desc',
        },
      });

      if (sortOrder < 0 || sortOrder > menus.length - 1) {
        throw new Error('Invalid sortOrder');
      }
    }

    return await prisma.menus.update({
      where: {
        id: menuId,
      },
      data: {
        title,
        description,
        price,
        sortOrder,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('title')
      ) {
        throw new Error('A menu with this title already exists');
      }
    }
    throw error;
  }
}

async function deleteMenu(menuId: string, restaurantId: string) {
  const menu = await prisma.menus.findUnique({
    where: {
      id: menuId,
    },
    select: {
      category: {
        select: {
          restaurantId: true,
        },
      },
    },
  });

  if (!menu || menu.category.restaurantId !== restaurantId) {
    throw new Error('Menu not found');
  }

  await prisma.menus.delete({
    where: {
      id: menuId,
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
};
