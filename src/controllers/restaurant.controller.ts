import { Response, Request } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { ZodError } from 'zod';
import validator from 'validator';
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
import controllerWorkflow from '../templateMethods/controllerWorkflow';

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

// Helper: Sanitize input
function sanitizeInput(input: string): string {
  console.log('I am here:', input);

  return validator.escape(input); // Escapes HTML and SQL special characters
}

// Helper: Validate CUID
function isCuid(value: string): boolean {
  const cuidRegex = /^c[0-9a-zA-Z_-]{24}$/; // Matches CUID format
  return typeof value === 'string' && cuidRegex.test(value);
}

// Controller Methods
async function handleCreateCategory(req: CustomRequest, res: Response) {
  return controllerWorkflow<
    { title: string; description?: string }, // Input type
    {
      category: {
        id: string;
        title: string;
        description?: string;
        sortOrder: number;
        createdAt: Date;
      };
    } // Output type
  >(req, res, {
    validateSchema: createCategorySchema.parse,
    sanitize: data => ({
      title: sanitizeInput(data.title),
      description: data.description
        ? sanitizeInput(data.description)
        : undefined,
    }),
    serviceCall: async data => {
      const category = await createCategory(
        data.title,
        req.userId as string,
        data.description,
      );

      if (!category) {
        throw new Error('Category creation failed.');
      }

      return {
        category: {
          id: category.id,
          title: category.title,
          description: category.description ?? undefined,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
        },
      };
    },
    successMessage: 'Category created successfully',
    successStatusCode: 201,
  });
}

async function handleUpdateCategory(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const { title, description, sortOrder } = req.body;

    if (!isCuid(categoryId)) {
      return res.status(400).json({ message: 'Invalid categoryId format.' });
    }

    const sanitizedTitle = title !== undefined ? sanitizeInput(title) : title;
    const sanitizedDescription =
      description !== undefined ? sanitizeInput(description) : description;
    const sanitizedSortOrder = sortOrder !== undefined ? sortOrder : undefined;

    updateCategorySchema.parse({
      title: sanitizedTitle,
      description: sanitizedDescription,
      sortOrder: sanitizedSortOrder,
    });

    const category = await updateCategory(
      categoryId,
      sanitizedTitle,
      sanitizedDescription,
      sanitizedSortOrder,
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
    const { categoryId } = req.params;

    if (!isCuid(categoryId)) {
      return res.status(400).json({ message: 'Invalid categoryId format.' });
    }

    await deleteCategory(categoryId, req.userId as string);

    return successResponse(res, 200, 'Category deleted successfully', {});
  } catch (error) {
    handleError(error, res);
  }
}

async function handleCreateMenu(req: CustomRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const { title, description, price } = req.body;

    if (!isCuid(categoryId)) {
      return res.status(400).json({ message: 'Invalid categoryId format.' });
    }

    createMenuSchema.parse({ title, description, price });

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);

    const menu = await createMenu(
      sanitizedTitle,
      sanitizedDescription,
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

    if (!isCuid(categoryId)) {
      return res.status(400).json({ message: 'Invalid categoryId format.' });
    }

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

    if (!isCuid(menuId)) {
      return res.status(400).json({ message: 'Invalid menuId format.' });
    }

    updateMenuSchema.parse({ title, description, price });

    const sanitizedTitle = sanitizeInput(title);

    const sanitizedDescription = sanitizeInput(description);

    const menu = await updateMenu(
      menuId,
      sanitizedTitle,
      sanitizedDescription,
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
    const { restaurantId } = req.params;

    if (!isCuid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId format.' });
    }

    const categories = await getCategoriesByRestaurantId(restaurantId);

    return successResponse(res, 200, 'Categories retrieved successfully', {
      categories,
    });
  } catch (error) {
    handleError(error, res);
  }
}

async function handleDeleteMenu(req: CustomRequest, res: Response) {
  try {
    const { menuId } = req.params;

    if (!isCuid(menuId)) {
      return res.status(400).json({ message: 'Invalid menuId format.' });
    }

    await deleteMenu(menuId, req.userId as string);

    return successResponse(res, 200, 'Menu deleted successfully', {});
  } catch (error) {
    handleError(error, res);
  }
}

async function handleGetCategoryById(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;

    if (!isCuid(categoryId)) {
      return res.status(400).json({ message: 'Invalid categoryId format.' });
    }

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

    if (!isCuid(menuId)) {
      return res.status(400).json({ message: 'Invalid menuId format.' });
    }

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
    const { restaurantId } = req.params;

    if (!isCuid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId format.' });
    }

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
