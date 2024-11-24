import { Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { getRestaurantsByZipCode } from '../services/search.service';

async function handleGetRestaurantsByZipCode(
  req: CustomRequest,
  res: Response,
) {
  try {
    const zipCode = req.params.zip;

    const { restaurants } = await getRestaurantsByZipCode(zipCode);

    return res.status(200).json(restaurants);
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
