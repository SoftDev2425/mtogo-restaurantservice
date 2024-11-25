import express from 'express';
import searchController from '../controllers/search.controller';

const router = express.Router();

router.get('/', (_req, res) => res.sendStatus(200));

router.get('/zipcode/:zipcode', searchController.handleGetRestaurantsByZipCode);

export default router;
