import { getCategoriesByRestaurantId } from './restaurant.service';
import { Restaurant } from '../types/Restaurant';
import { validateZipCodeSearch } from '../validations/validateZipCodeSearch';
import levenshtein from 'fast-levenshtein';

interface RestaurantResponse {
  restaurants: Restaurant[];
}

async function getRestaurantsByZipCode(zipcode: string, categories?: string[]) {
  validateZipCodeSearch(zipcode);

  const restaurantData = await fetch(
    `${process.env.AUTH_SERVICE_URL}/api/restaurants/zipcode/${zipcode}`,
  );

  const response = (await restaurantData.json()) as RestaurantResponse;

  const restaurantsWithCategories = await Promise.all(
    response.restaurants.map(async (restaurant: Restaurant) => {
      const restaurantCategories = await getCategoriesByRestaurantId(
        restaurant.id,
      );
      const categoryTitles = restaurantCategories.map(
        category => category.title,
      );

      return filterRestaurantByCategory(restaurant, categoryTitles, categories);
    }),
  );

  // Remove null entries (restaurants that didn't match the category filter)
  const filteredRestaurants = restaurantsWithCategories.filter(
    restaurant => restaurant !== null,
  );
  return { restaurants: filteredRestaurants };
}

// Helper function to filter a restaurant by category
function filterRestaurantByCategory(
  restaurant: Restaurant,
  categoryTitles: string[],
  categories?: string[],
) {
  if (categories && categories.length > 0) {
    const matchingCategories = getMatchingCategories(
      categoryTitles,
      categories,
    );

    // If there are no matching categories, return null to filter out this restaurant
    if (matchingCategories.length === 0) {
      return null;
    }

    // Return restaurant with only matching categories
    return {
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      address: {
        street: restaurant.address.street,
        city: restaurant.address.city,
        zip: restaurant.address.zip,
        x: restaurant.address.x,
        y: restaurant.address.y,
      },
      categories: matchingCategories,
    };
  }

  // If no category filter is provided, return the restaurant with all its categories
  return {
    name: restaurant.name,
    email: restaurant.email,
    phone: restaurant.phone,
    address: {
      street: restaurant.address.street,
      city: restaurant.address.city,
      zip: restaurant.address.zip,
      x: restaurant.address.x,
      y: restaurant.address.y,
    },
    categories: categoryTitles,
  };
}

// Helper function to get matching categories (with fuzzy matching support)
function getMatchingCategories(categoryTitles: string[], categories: string[]) {
  // Define similarity threshold
  const SIMILARITY_THRESHOLD = 2; // Maximum Levenshtein distance for a match

  return categoryTitles.filter(title => {
    const isMatching = categories.some(category => {
      const distance = levenshtein.get(
        title.toLowerCase(),
        category.toLowerCase(),
      );

      return (
        distance <= SIMILARITY_THRESHOLD ||
        title.toLowerCase().includes(category.toLowerCase())
      );
    });

    return isMatching;
  });
}

export { getRestaurantsByZipCode };
