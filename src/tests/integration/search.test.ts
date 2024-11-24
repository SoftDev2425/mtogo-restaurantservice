import supertest from 'supertest';
import { app } from '../setup/setup';
import * as restaurantService from '../../services/search.service';

jest.mock('../../services/search.service', () => ({
  ...jest.requireActual('../../services/search.service'), // retain any real implementation if needed
  getRestaurantsByZipCode: jest.fn(),
}));

describe('Search Restaurants by Zip Code', () => {
  it('should return restaurants when search with zip code', async () => {
    // Arrange
    const zipCode = '1234';

    // Mock the data response for the restaurants
    const mockedRestaurants = [
      {
        name: 'The Danish Delight',
        email: 'delight@danishmail.com',
        phone: '12345678',
        categories: ['Pizza', 'Burger'],
      },
      {
        name: 'Copenhagen Cuisine',
        email: 'cuisine@danishmail.com',
        phone: '87654321',
        categories: ['Danish', 'Seafood'],
      },
    ];

    // Type the mock function for `getRestaurantsByZipCode`
    const mockedGetRestaurantsByZipCode =
      restaurantService.getRestaurantsByZipCode as jest.Mock;

    // Mock the database or the function that fetches restaurant data
    mockedGetRestaurantsByZipCode.mockResolvedValue({
      restaurants: mockedRestaurants,
    });

    // Act & Assert
    const response = await supertest(app)
      .get(`/api/search/zipcode/${zipCode}`)
      .expect(200); // Assert that status code is 200

    // Assert that the returned restaurants match the mocked data
    expect(response.body).toEqual(mockedRestaurants);
  });
});
