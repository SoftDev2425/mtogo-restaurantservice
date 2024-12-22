import { Prisma } from '@prisma/client';
import {
  getBasket,
  addToBasket,
  clearBasket,
  updateBasketItem,
  getBasketById,
} from '../services/basket.service';
import { CustomRequest } from '../types/CustomRequest';
import { Response } from 'express';
import { updateBasketSchema } from '../validations/updateBasketSchema';
import { ZodError } from 'zod';
import { addToBasketSchema } from '../validations/addToBasketSchema';

async function handleGetBasketById(req: CustomRequest, res: Response) {
  try {
    const { id } = req.params;

    const basket = await getBasketById(req.userId as string, id);

    if (!basket) {
      return res.status(404).json({
        message: 'Basket not found.',
      });
    }

    res.status(200).json({
      basket,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleGetBasket(req: CustomRequest, res: Response) {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        message: 'Restaurant ID is required in the query params',
      });
    }

    const basket = await getBasket(
      req.userId as string,
      restaurantId as string,
    );

    if (!basket) {
      return res.status(404).json({
        message: 'Basket not found for the given customer and restaurant.',
      });
    }

    res.status(200).json({
      basket,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleAddToBasket(req: CustomRequest, res: Response) {
  try {
    const { menuId, title, quantity, restaurantId } = req.body;

    addToBasketSchema.parse({ menuId, title, quantity, restaurantId });

    const basket = await addToBasket(
      req.userId as string,
      menuId,
      title,
      quantity,
      restaurantId,
    );

    if (!basket) {
      return res.status(404).json({
        message:
          'Basket not found for the given customer and restaurant. Basket might have been cleared.',
      });
    }

    res.status(201).json({
      message: 'Menu added to basket successfully',
      basket,
    });
  } catch (error) {
    // Handle validation errors
    console.log(error);
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    }

    // Handle database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // Unique constraint failed
          return res.status(400).json({
            message: 'A unique constraint violation occurred.',
          });
        case 'P2003': // Foreign key constraint failed
          return res.status(400).json({
            message:
              'Foreign key constraint violation. Ensure the menuId and restaurantId exist.',
          });
        case 'P2025': // Record not found
          return res.status(404).json({
            message: 'The specified record does not exist.',
          });
        default:
          return res.status(500).json({
            message: 'A database error occurred.',
            details: error.message,
          });
      }
    }

    // Handle unexpected errors
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    // Default error response
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleUpdateBasket(req: CustomRequest, res: Response) {
  try {
    const { itemId, quantity, price, restaurantId } = req.body;

    updateBasketSchema.parse({ itemId, quantity, restaurantId });

    const basket = await updateBasketItem(
      req.userId as string,
      itemId,
      quantity,
      price,
      restaurantId,
    );

    res.status(200).json({
      message: 'Basket updated successfully',
      basket,
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

async function handleClearBasket(req: CustomRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Basket ID is required in the request params',
      });
    }

    await clearBasket(req.userId as string, id as string);

    return res.status(200).json({
      message: 'Basket cleared successfully',
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          message: 'Basket not found or already cleared.',
        });
      }
    } else if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    // Fallback error response
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default {
  handleGetBasketById,
  handleGetBasket,
  handleAddToBasket,
  handleUpdateBasket,
  handleClearBasket,
};
