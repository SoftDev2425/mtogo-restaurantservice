import { Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { createCategorySchema } from '../validations/createCategoryScema';
import { ZodError } from 'zod';
import {
  createCategory,
  createMenu,
  deleteCategory,
  deleteMenu,
  getCategoriesByRestaurantId,
  getCategoryById,
  getMenuById,
  getMenusByCategoryId,
  getRestaurantDetailsByRestaurantId,
  // getRestaurantDetailsByRestaurantId,
  updateCategory,
  updateMenu,
} from '../services/restaurant.service';
import { createMenuSchema } from '../validations/createMenuSchema';
import { updateCategorySchema } from '../validations/updateCategorySchema';
import { updateMenuSchema } from '../validations/updateMenuSchema';
import { Request } from 'express';

async function handleCreateCategory(req: CustomRequest, res: Response) {
  try {
    const { title, description } = req.body;

    createCategorySchema.parse({
      title,
      description,
    });

    const category = await createCategory(
      title,
      description,
      req.userId as string,
    );

    return res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: category.id,
        title: category.title,
        sortOrder: category.sortOrder,
        description: category.description,
        createdAt: category.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleUpdateCategory(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const { title, description, sortOrder } = req.body;

    updateCategorySchema.parse({
      title,
      description,
      sortOrder,
    });

    const category = await updateCategory(
      categoryId,
      title,
      description,
      sortOrder,
      req.userId as string,
    );

    return res.status(200).json({
      message: 'Category updated successfully',
      category: {
        id: category.id,
        title: category.title,
        description: category.description,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleDeleteCategory(req: CustomRequest, res: Response) {
  try {
    await deleteCategory(req.params.categoryId, req.userId as string);

    return res.status(200).json({
      message: `Category deleted successfully`,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleCreateMenu(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const { title, description, price } = req.body;

    createMenuSchema.parse({
      title,
      description,
      price,
    });

    const menu = await createMenu(
      title,
      description,
      price,
      categoryId,
      req.userId as string,
    );

    return res.status(201).json({
      message: 'Menu created successfully',
      menu: {
        id: menu.id,
        title: menu.title,
        description: menu.description,
        price: menu.price,
        createdAt: menu.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleGetMenusByCategory(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const menus = await getMenusByCategoryId(categoryId);

    if (!menus || menus.length === 0) {
      return res.status(404).json({ message: 'Menus not found' });
    }

    const formattedMenus = menus.map(menu => ({
      id: menu.id,
      title: menu.title,
      description: menu.description,
      price: menu.price,
      createdAt: menu.createdAt,
    }));

    return res.status(200).json({
      menus: formattedMenus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleUpdateMenu(req: CustomRequest, res: Response) {
  try {
    const { menuId } = req.params;
    const { title, description, price } = req.body;

    updateMenuSchema.parse({
      title,
      description,
      price,
    });

    const menu = await updateMenu(
      menuId,
      title,
      description,
      price,
      req.userId as string,
    );

    return res.status(200).json({
      message: 'Menu updated successfully',
      menu: {
        id: menu.id,
        title: menu.title,
        description: menu.description,
        price: menu.price,
        createdAt: menu.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleGetCategoriesByRestaurantId(
  req: CustomRequest,
  res: Response,
) {
  try {
    const categories = await getCategoriesByRestaurantId(
      req.params.restaurantId,
    );

    return res.status(200).json({
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleDeleteMenu(req: CustomRequest, res: Response) {
  try {
    await deleteMenu(req.params.menuId, req.userId as string);

    return res.status(200).json({
      message: `Menu deleted successfully`,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// async function handleGetNearbyRestaurants(req: CustomRequest, res: Response) {
//   try {
//     const { city, zipCode } = req.query;

//     if (!city || !zipCode) {
//       return res
//         .status(400)
//         .json({
//           message: 'City and zip code are required as query parameters',
//         });
//     }

//     const restaurants = await getNearbyRestaurants(city as string, zipCode as string);

//     return res.status(200).json({
//       restaurants,
//     });
//   } catch (error) {}
// }

// async function handleGetRestaurantDetailsByRestaurantId(
//   req: CustomRequest,
//   res: Response,
// ) {
//   try {
//     // Get restaurant details
//     const restaurantId = req.params.restaurantId;

//     // Return restaurant details
//     const restaurant = await getRestaurantDetailsByRestaurantId(restaurantId);

//     return res.status(200).json({
//       restaurant,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }

async function handleGetCategoryById(req: Request, res: Response) {
  try {
    const categoryId = req.params.categoryId;

    const category = await getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    return res.status(200).json({
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleGetMenuById(req: CustomRequest, res: Response) {
  try {
    // Get menu details
    const menuId = req.params.menuId;

    // Return menu details
    const menu = await getMenuById(menuId);

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found.' });
    }

    return res.status(200).json({
      menu,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleGetRestaurantDetailsByRestaurantId(
  req: CustomRequest,
  res: Response,
) {
  try {
    // Get restaurant details
    const restaurantId = req.params.restaurantId;

    // Return restaurant details
    const restaurant = await getRestaurantDetailsByRestaurantId(restaurantId);

    return res.status(200).json({
      restaurant,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default {
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleCreateMenu,
  handleGetMenusByCategory,
  handleUpdateMenu,
  handleGetCategoriesByRestaurantId,
  handleDeleteMenu,
  // handleGetNearbyRestaurants,
  handleGetRestaurantDetailsByRestaurantId,
  handleGetMenuById,
  handleGetCategoryById,
};
