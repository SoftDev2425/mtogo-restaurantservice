import { Prisma } from '@prisma/client';
import {
  getBasket,
  addToBasket,
  updateBasketItem,
  clearBasket,
  checkout,
} from '../services/basket.service';
import { CustomRequest } from '../types/CustomRequest';
import { Response } from 'express';
import { updateBasketSchema } from '../validations/updateBasketSchema';
import { ZodError } from 'zod';

async function handleGetBasket(req: CustomRequest, res: Response) {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        message: 'Restaurant ID is required in the request body',
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
    const { menuId, quantity, price, restaurantId } = req.body;

    if (!menuId || !quantity || !price || !restaurantId) {
      return res.status(400).json({
        message:
          'menuId, quantity, price, and restaurantId are required in the request body',
      });
    }

    const basket = await addToBasket(
      req.userId as string,
      menuId,
      quantity,
      price,
      restaurantId,
    );

    res.status(200).json({
      message: 'Menu added to basket successfully',
      basket,
    });
  } catch (error) {
    console.error(error);

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

    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
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
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        message: 'restaurantId is required in the request body',
      });
    }

    await clearBasket(req.userId as string, restaurantId as string);

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

async function handleCheckout(req: CustomRequest, res: Response) {
  try {
    const { restaurantId } = req.body;

    const order = await checkout(req.userId as string, restaurantId);

    res.status(200).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default {
  handleGetBasket,
  handleAddToBasket,
  handleUpdateBasket,
  handleClearBasket,
  handleCheckout,
};
