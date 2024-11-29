import restaurantController from '../controllers/restaurant.controller';
import { requireRestaurant, requireRoles } from '../middlewares/role';
import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => res.sendStatus(200));

// Create Category: POST /restaurant/categories
router.post(
  '/categories',
  requireRestaurant,
  restaurantController.handleCreateCategory,
);

// Update Category: PUT /restaurant/categories/:categoryId
router.put(
  '/categories/:categoryId',
  requireRestaurant,
  restaurantController.handleUpdateCategory,
);

// Delete Category: DELETE /restaurant/categories/:categoryId
router.delete(
  '/categories/:categoryId',
  requireRestaurant,
  restaurantController.handleDeleteCategory,
);

// Create Menu: POST /restaurant/categories/:categoryId/menus
router.post(
  '/categories/:categoryId/menus',
  requireRestaurant,
  restaurantController.handleCreateMenu,
);

// Get menus by category id: GET /restaurant/categories/:categoryId/menus
router.get(
  '/categories/:categoryId/menus',
  requireRoles(['restaurant', 'customer']),
  restaurantController.handleGetMenusByCategory,
);

// Update Menu: PUT /restaurant/menus/:menuId
router.put(
  '/menus/:menuId',
  requireRestaurant,
  restaurantController.handleUpdateMenu,
);

// Delete Menu: DELETE /restaurant/menus/:menuId
router.delete(
  '/menus/:menuId',
  requireRestaurant,
  restaurantController.handleDeleteMenu,
);

// Get categories by restaurant id: GET /restaurant/categories/:restaurantId
router.get(
  '/:restaurantId/categories',
  requireRoles(['restaurant', 'customer']),
  restaurantController.handleGetCategoriesByRestaurantId,
);

// Get nearby restaurants by city and zip code: GET /restaurants/nearby?city=:city&zipCode=:zipCode
// router.get('/nearby', restaurantController.handleGetNearbyRestaurants);

// Get Restaurant Details: GET /restaurants/:restaurantId
// TODO - FIX THIS
router.get(
  '/:restaurantId',
  restaurantController.handleGetRestaurantDetailsByRestaurantId,
);

router.get('/menus/:menuId', restaurantController.handleGetMenuById);

// confirm order pickup: POST /restaurant/orders/:orderId/confirm

export default router;
