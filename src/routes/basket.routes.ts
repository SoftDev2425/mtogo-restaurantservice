import basketController from '../controllers/basket.controller';
import { requireCustomer } from '../middlewares/role';
import express from 'express';

const router = express.Router();

// BASKET ROUTES
router.get('/:id', requireCustomer, basketController.handleGetBasketById);

router.get('/', requireCustomer, basketController.handleGetBasket);

router.post('/', requireCustomer, basketController.handleAddToBasket);

router.put('/', requireCustomer, basketController.handleUpdateBasket);

router.delete(
  '/:id/clear',
  requireCustomer,
  basketController.handleClearBasket,
);

export default router;
