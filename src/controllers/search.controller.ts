import { Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { getRestaurantsByZipCode } from '../services/search.service';

async function handleGetRestaurantsByZipCode(
  req: CustomRequest,
  res: Response,
) {
  try {
    const { zipcode } = req.params;

    const categoryQuery = req.query.category;

    let categories: string[] = [];

    if (typeof categoryQuery === 'string') {
      categories = categoryQuery.split(/[,&]/).map(cat => cat.trim());
    } else if (Array.isArray(categoryQuery)) {
      categories = (categoryQuery as string[]).map(cat => String(cat).trim());
    }

    const { restaurants } = await getRestaurantsByZipCode(zipcode, categories);

    return res.status(200).json(restaurants.length > 0 ? restaurants : []);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default {
  handleGetRestaurantsByZipCode,
};
