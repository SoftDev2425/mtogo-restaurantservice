import { getCategoriesByRestaurantId } from './restaurant.service';
import { Restaurant } from '../types/Restaurant';
import { validateZipCodeSearch } from '../validations/validateZipCodeSearch';

interface RestaurantResponse {
  restaurants: Restaurant[];
}

async function getRestaurantsByZipCode(zipcode: string, category?: string) {
  validateZipCodeSearch(zipcode);

  console.log('Before fetch', zipcode, category);

  const restaurantData = await fetch(
    `${process.env.AUTH_SERVICE_URL}/api/restaurants/zipcode/${zipcode}`,
  );

  console.log('After fetch', restaurantData);

  const response = (await restaurantData.json()) as RestaurantResponse;

  const restaurantsWithCategories = await Promise.all(
    response.restaurants.map(async (restaurant: Restaurant) => {
      const categories = await getCategoriesByRestaurantId(restaurant.id);
      const categoryTitles = categories.map(category => category.title);

      return filterRestaurantByCategory(restaurant, categoryTitles, category);
    }),
  );

  // Remove null entries (restaurants that didn't match the category filter)
  const filteredRestaurants = restaurantsWithCategories.filter(
    restaurant => restaurant !== null,
  );
  return {
    restaurants: filteredRestaurants,
  };
}

// Helper function to filter a restaurant by category
function filterRestaurantByCategory(
  restaurant: Restaurant,
  categoryTitles: string[],
  category?: string,
) {
  if (category) {
    const matchingCategories = getMatchingCategories(categoryTitles, category);

    // If there are no matching categories, return null to filter out this restaurant
    if (matchingCategories.length === 0) {
      return null;
    }

    // Return restaurant with only matching categories
    return {
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      categories: matchingCategories,
    };
  }

  // If no category filter is provided, return the restaurant with all its categories
  return {
    name: restaurant.name,
    email: restaurant.email,
    phone: restaurant.phone,
    categories: categoryTitles,
  };
}

// Helper function to get matching categories (if any)
function getMatchingCategories(categoryTitles: string[], category: string) {
  if (!category || typeof category !== 'string') {
    return [];
  }

  return categoryTitles.filter(
    cat => cat.toLowerCase() === category.toLowerCase(),
  );
}

export { getRestaurantsByZipCode };
