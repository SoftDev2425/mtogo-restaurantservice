import {
  getBasket,
  addToBasket,
  updateBasketItem,
  clearBasket,
  checkout,
} from '../services/basket.service';
import { CustomRequest } from '../types/CustomRequest';
import { Response } from 'express';

async function handleGetBasket(req: CustomRequest, res: Response) {
  try {
    const { restaurantId } = req.query;

    const basket = await getBasket(
      req.userId as string,
      restaurantId as string,
    );

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
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleUpdateBasket(req: CustomRequest, res: Response) {
  try {
    const { itemId, quantity, price, restaurantId } = req.body;

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
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleDeleteBasket(req: CustomRequest, res: Response) {
  try {
    const { restaurantId } = req.body;

    await clearBasket(req.userId as string, restaurantId as string);

    res.status(200).json({
      message: 'Basket cleared successfully',
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
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
  handleDeleteBasket,
  handleCheckout,
};
