import { Response, Request } from 'express';
import { CustomRequest } from '../types/CustomRequest';
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
  updateCategory,
  updateMenu,
} from '../services/restaurant.service';
import { createCategorySchema } from '../validations/createCategoryScema';
import { createMenuSchema } from '../validations/createMenuSchema';
import { updateCategorySchema } from '../validations/updateCategorySchema';
import { updateMenuSchema } from '../validations/updateMenuSchema';

// Helper: Common error handler
function handleError(error: unknown, res: Response) {
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
  return res.status(500).json({ message: 'Internal Server Error' });
}

// Helper: Format success response
function successResponse(
  res: Response,
  statusCode: number,
  message: string,
  data: object,
) {
  return res.status(statusCode).json({ message, ...data });
}

// Controller Methods
async function handleCreateCategory(req: CustomRequest, res: Response) {
  try {
    const { title, description } = req.body;

    createCategorySchema.parse({ title, description });

    const category = await createCategory(
      title,
      description,
      req.userId as string,
    );

    return successResponse(res, 201, 'Category created successfully', {
      category: {
        id: category?.id,
        title: category?.title,
        sortOrder: category?.sortOrder,
        description: category?.description,
        createdAt: category?.createdAt,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
}

async function handleUpdateCategory(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const { title, description, sortOrder } = req.body;

    updateCategorySchema.parse({ title, description, sortOrder });

    const category = await updateCategory(
      categoryId,
      title,
      description,
      sortOrder,
      req.userId as string,
    );

    return successResponse(res, 200, 'Category updated successfully', {
      category: {
        id: category?.id,
        title: category?.title,
        description: category?.description,
        sortOrder: category?.sortOrder,
        createdAt: category?.createdAt,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
}

async function handleDeleteCategory(req: CustomRequest, res: Response) {
  try {
    await deleteCategory(req.params.categoryId, req.userId as string);

    return successResponse(res, 200, 'Category deleted successfully', {});
  } catch (error) {
    handleError(error, res);
  }
}

async function handleCreateMenu(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const { title, description, price } = req.body;

    createMenuSchema.parse({ title, description, price });

    const menu = await createMenu(
      title,
      description,
      price,
      categoryId,
      req.userId as string,
    );

    return successResponse(res, 201, 'Menu created successfully', {
      menu: {
        id: menu?.id,
        title: menu?.title,
        description: menu?.description,
        price: menu?.price,
        createdAt: menu?.createdAt,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
}

async function handleGetMenusByCategory(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const menus = await getMenusByCategoryId(categoryId);

    if (!menus || menus.length === 0) {
      return res.status(404).json({ message: 'Menus not found' });
    }

    return successResponse(res, 200, 'Menus retrieved successfully', {
      menus: menus.map(menu => ({
        id: menu.id,
        title: menu.title,
        description: menu.description,
        price: menu.price,
        createdAt: menu.createdAt,
      })),
    });
  } catch (error) {
    handleError(error, res);
  }
}

async function handleUpdateMenu(req: CustomRequest, res: Response) {
  try {
    const { menuId } = req.params;
    const { title, description, price } = req.body;

    updateMenuSchema.parse({ title, description, price });

    const menu = await updateMenu(
      menuId,
      title,
      description,
      price,
      req.userId as string,
    );

    return successResponse(res, 200, 'Menu updated successfully', {
      menu: {
        id: menu?.id,
        title: menu?.title,
        description: menu?.description,
        price: menu?.price,
        createdAt: menu?.createdAt,
      },
    });
  } catch (error) {
    handleError(error, res);
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

    return successResponse(res, 200, 'Categories retrieved successfully', {
      categories,
    });
  } catch (error) {
    handleError(error, res);
  }
}

async function handleDeleteMenu(req: CustomRequest, res: Response) {
  try {
    await deleteMenu(req.params.menuId, req.userId as string);

    return successResponse(res, 200, 'Menu deleted successfully', {});
  } catch (error) {
    handleError(error, res);
  }
}

async function handleGetCategoryById(req: Request, res: Response) {
  try {
    const categoryId = req.params.categoryId;

    const category = await getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    return successResponse(res, 200, 'Category retrieved successfully', {
      category,
    });
  } catch (error) {
    handleError(error, res);
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

    return successResponse(res, 200, 'Menu retrieved successfully', {
      menu,
    });
  } catch (error) {
    handleError(error, res);
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

    return successResponse(
      res,
      200,
      'Restaurant details retrieved successfully',
      {
        restaurant,
      },
    );
  } catch (error) {
    handleError(error, res);
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
  handleGetRestaurantDetailsByRestaurantId,
  handleGetMenuById,
  handleGetCategoryById,
};
