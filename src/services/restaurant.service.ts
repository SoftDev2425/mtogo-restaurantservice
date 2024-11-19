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
    const categories = await prisma.categories.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        sortOrder: 'desc',
      },
    });

    const sortOrder = categories.length > 0 ? categories[0].sortOrder + 1 : 0;

    return await prisma.categories.create({
      data: {
        title,
        description,
        sortOrder: sortOrder,
        restaurantId,
      },
      select: {
        id: true,
        title: true,
        sortOrder: true,
        description: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('title')
      ) {
        throw new Error('A category with this title already exists');
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
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.restaurantId !== restaurantId) {
      throw new Error('Category not found');
    }

    if (sortOrder !== category.sortOrder) {
      const categories = await prisma.categories.findMany({
        where: {
          restaurantId,
        },
        orderBy: {
          sortOrder: 'desc',
        },
      });

      if (sortOrder < 0 || sortOrder > categories.length - 1) {
        throw new Error('Invalid sortOrder');
      }
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
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('title')
      ) {
        throw new Error('A category with this title already exists');
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
  sortOrder: number,
  categoryId: string,
  restaurantId: string,
) {
  try {
    // validate sortOrder
    const category = await prisma.categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category || category.restaurantId !== restaurantId) {
      throw new Error('Category not found');
    }

    const menus = await prisma.menus.findMany({
      where: {
        categoryId,
      },
      orderBy: {
        sortOrder: 'desc',
      },
    });

    if (menus.length > 0) {
      sortOrder = menus[menus.length - 1].sortOrder + 1;
    } else {
      sortOrder = 1;
    }

    return await prisma.menus.create({
      data: {
        title,
        description,
        price,
        sortOrder,
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
        throw new Error('A menu with this title already exists');
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

export {
  createCategory,
  updateCategory,
  deleteCategory,
  createMenu,
  getMenusByCategoryId,
  updateMenu,
  deleteMenu,
  // getRestaurantDetailsByRestaurantId,
  getCategoriesByRestaurantId,
  getMenuById,
};
