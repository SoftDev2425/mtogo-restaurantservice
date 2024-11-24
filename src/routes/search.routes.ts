import express from 'express';
import searchController from '../controllers/search.controller';

const router = express.Router();

router.get('/', (_req, res) => res.sendStatus(200));

router.get('/zipcode/:zip', searchController.handleGetRestaurantsByZipCode);

// In your router file
router.get(
  '/zipcode/:zip/category/:category',
  searchController.handleGetRestaurantsByZipCode,
);

export default router;
