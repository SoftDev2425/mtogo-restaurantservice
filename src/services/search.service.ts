import { getCategoriesByRestaurantId } from './restaurant.service';
import { Restaurant } from '../types/Restaurant';
import { validateZipCodeSearch } from '../validations/validateZipCodeSearch';

interface RestaurantResponse {
  restaurants: Restaurant[];
}

async function getRestaurantsByZipCode(zipcode: string) {
  validateZipCodeSearch(zipcode);

  const restaurantData = await fetch(
    `${process.env.AUTH_SERVICE_URL}/api/restaurants/zipcode/${zipcode}`,
  );

  const response = (await restaurantData.json()) as RestaurantResponse;

  const restaurantsAndCategories = await Promise.all(
    response.restaurants.map(async (restaurant: Restaurant) => {
      const categories = await getCategoriesByRestaurantId(restaurant.id);

      const categoryTitles = categories.map(category => category.title);

      return {
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        categories: categoryTitles,
      };
    }),
  );

  return {
    restaurants: restaurantsAndCategories,
  };
}

export { getRestaurantsByZipCode };
