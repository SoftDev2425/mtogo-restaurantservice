import { Response, Request } from 'express';
import { CustomRequest } from '../types/CustomRequest';
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

// Helper: Sanitize input
function sanitizeInput(input: string): string {
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
  return controllerWorkflow<
    { title?: string; description?: string; sortOrder?: number }, // Input type
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
    validateParams: params => {
      if (!isCuid(params.categoryId)) {
        throw new Error('Unexpected error.');
      }
    },
    validateSchema: updateCategorySchema.parse,
    sanitize: data => ({
      title: data.title ? sanitizeInput(data.title) : undefined,
      description: data.description
        ? sanitizeInput(data.description)
        : undefined,
      sortOrder: data.sortOrder,
    }),
    serviceCall: async data => {
      const category = await updateCategory(
        req.params.categoryId,
        req.userId as string,
        data.title,
        data.description,
        data.sortOrder,
      );

      if (!category) {
        throw new Error('Category update failed.');
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
    successMessage: 'Category updated successfully',
    successStatusCode: 200,
  });
}

async function handleDeleteCategory(req: CustomRequest, res: Response) {
  return controllerWorkflow<object, object>(req, res, {
    validateParams: params => {
      if (!isCuid(params.categoryId)) {
        throw new Error('Invalid categoryId format.');
      }
    },
    serviceCall: async () => {
      await deleteCategory(req.params.categoryId, req.userId as string);
      return {}; // No data to return in the response body
    },
    successMessage: 'Category deleted successfully',
    successStatusCode: 200,
  });
}

async function handleCreateMenu(req: CustomRequest, res: Response) {
  return controllerWorkflow<
    { title: string; description?: string; price: number },
    {
      menu: {
        id: string;
        title: string;
        description?: string;
        price: number;
        createdAt: Date;
      };
    }
  >(req, res, {
    validateParams: params => {
      if (!isCuid(params.categoryId)) {
        throw new Error('Invalid categoryId format.');
      }
    },
    validateSchema: createMenuSchema.parse,
    sanitize: data => ({
      title: sanitizeInput(data.title),
      description: data.description
        ? sanitizeInput(data.description)
        : undefined,
      price: data.price,
    }),
    serviceCall: async data => {
      const menu = await createMenu(
        data.title,
        data.price,
        req.params.categoryId,
        req.userId as string,
        data.description,
      );

      if (!menu) {
        throw new Error('Menu creation failed.');
      }

      return {
        menu: {
          id: menu.id,
          title: menu.title,
          description: menu.description ?? undefined,
          price: menu.price,
          createdAt: menu.createdAt,
        },
      };
    },
    successMessage: 'Menu created successfully',
    successStatusCode: 201,
  });
}

async function handleGetMenusByCategory(req: CustomRequest, res: Response) {
  return controllerWorkflow<
    object, // Input type (no body for GET requests)
    {
      id: string;
      title: string;
      description?: string;
      price: number;
      createdAt: Date;
    }[]
  >(req, res, {
    validateParams: params => {
      if (!isCuid(params.categoryId)) {
        throw new Error('Invalid categoryId format.');
      }
    },
    serviceCall: async () => {
      const menus = await getMenusByCategoryId(req.params.categoryId);

      if (!menus || menus.length === 0) {
        throw new Error('Menus not found.');
      }

      return menus.map(menu => ({
        id: menu.id,
        title: menu.title,
        description: menu.description ?? undefined,
        price: menu.price,
        createdAt: menu.createdAt,
      }));
    },
    successMessage: 'Menus retrieved successfully',
    successStatusCode: 200,
  });
}

async function handleUpdateMenu(req: CustomRequest, res: Response) {
  return controllerWorkflow<
    { title?: string; description?: string; price?: number },
    {
      menu: {
        id: string;
        title: string;
        description?: string;
        price: number;
        createdAt: Date;
      };
    }
  >(req, res, {
    validateParams: params => {
      if (!isCuid(params.menuId)) {
        throw new Error('Invalid menuId format.');
      }
    },
    validateSchema: updateMenuSchema.parse,
    sanitize: data => ({
      title: data.title ? sanitizeInput(data.title) : undefined,
      description: data.description
        ? sanitizeInput(data.description)
        : undefined,
      price: data.price,
    }),
    serviceCall: async data => {
      const menu = await updateMenu(
        req.params.menuId,
        req.userId as string,
        data.title,
        data.description,
        data.price,
      );

      if (!menu) {
        throw new Error('Menu update failed.');
      }

      return {
        menu: {
          id: menu.id,
          title: menu.title,
          description: menu.description ?? undefined,
          price: menu.price,
          createdAt: menu.createdAt,
        },
      };
    },
    successMessage: 'Menu updated successfully',
    successStatusCode: 200,
  });
}

async function handleGetCategoriesByRestaurantId(
  req: CustomRequest,
  res: Response,
) {
  return controllerWorkflow<
    object, // Input type (no body for GET requests)
    { categories: { title: string; description: string; sortOrder: number }[] }
  >(req, res, {
    validateParams: params => {
      if (!isCuid(params.restaurantId)) {
        throw new Error('Invalid restaurantId format.');
      }
    },

    serviceCall: async () => {
      const categories = await getCategoriesByRestaurantId(
        req.params.restaurantId,
      );

      return {
        categories: categories.map(category => ({
          title: category.title,
          description: category.description ?? '',
          sortOrder: category.sortOrder,
        })),
      };
    },
    successMessage: 'Categories retrieved successfully',
    successStatusCode: 200,
  });
}

async function handleDeleteMenu(req: CustomRequest, res: Response) {
  return controllerWorkflow<object, object>(req, res, {
    validateParams: params => {
      if (!isCuid(params.menuId)) {
        throw new Error('Invalid menuId format.');
      }
    },
    serviceCall: async () => {
      await deleteMenu(req.params.menuId, req.userId as string);
      return {};
    },
    successMessage: 'Menu deleted successfully',
    successStatusCode: 200,
  });
}

async function handleGetCategoryById(req: Request, res: Response) {
  return controllerWorkflow<object, { category: object }>(req, res, {
    validateParams: params => {
      if (!isCuid(params.categoryId)) {
        throw new Error('Invalid categoryId format.');
      }
    },
    serviceCall: async () => {
      const category = await getCategoryById(req.params.categoryId);

      if (!category) {
        throw new Error('Category not found.');
      }

      return { category };
    },
    successMessage: 'Category retrieved successfully',
    successStatusCode: 200,
  });
}

async function handleGetMenuById(req: CustomRequest, res: Response) {
  return controllerWorkflow<object, { menu: object }>(req, res, {
    validateParams: params => {
      if (!isCuid(params.menuId)) {
        throw new Error('Invalid menuId format.');
      }
    },
    serviceCall: async () => {
      const menu = await getMenuById(req.params.menuId);

      if (!menu) {
        throw new Error('Menu not found.');
      }

      return { menu };
    },
    successMessage: 'Menu retrieved successfully',
    successStatusCode: 200,
  });
}

async function handleGetRestaurantDetailsByRestaurantId(
  req: CustomRequest,
  res: Response,
) {
  return controllerWorkflow<object, { restaurant: object }>(req, res, {
    validateParams: params => {
      if (!isCuid(params.restaurantId)) {
        throw new Error('Invalid restaurantId format.');
      }
    },
    serviceCall: async () => {
      const restaurant = await getRestaurantDetailsByRestaurantId(
        req.params.restaurantId,
      );

      if (!restaurant) {
        throw new Error('Restaurant not found.');
      }

      return { restaurant };
    },
    successMessage: 'Restaurant details retrieved successfully',
    successStatusCode: 200,
  });
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
