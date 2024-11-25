import supertest from 'supertest';
import { app } from '../setup/setup';
import * as restaurantService from '../../services/search.service';

jest.mock('../../services/search.service', () => ({
  ...jest.requireActual('../../services/search.service'), // retain any real implementation if needed
  getRestaurantsByZipCode: jest.fn(),
}));

const URL = '/api/search/zipcode/';

describe('Search Restaurants by Zip Code', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    // Mock the function that fetches restaurant data
    mockedGetRestaurantsByZipCode.mockResolvedValue({
      restaurants: mockedRestaurants,
    });

    // Act & Assert
    const response = await supertest(app).get(`${URL}${zipCode}`).expect(200); // Assert that status code is 200

    // Assert that the returned restaurants match the mocked data
    expect(response.body).toEqual(mockedRestaurants);
  });

  it('should throw an error if sending invalid Zip Code', async () => {
    // Arrange
    const invalidZipCode = '123A';

    // Mock the service to return a rejected promise with an error
    const mockedGetRestaurantsByZipCode =
      restaurantService.getRestaurantsByZipCode as jest.Mock;
    mockedGetRestaurantsByZipCode.mockRejectedValue(
      new Error('Invalid Danish zip code'),
    );

    // Act & Assert
    const response = await supertest(app)
      .get(`${URL}${invalidZipCode}`)
      .expect(400);

    // Assert that the error message matches the expected error
    expect(response.body.message).toBe('Invalid Danish zip code');
  });
});

describe('Filter Search by Categories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const categoryURL = `${URL}1234?category=`;

  it('should successfully filter search result from category input', async () => {
    // Arrange
    const category = 'Pizza';

    // Mock the response data
    const mockFilteredRestaurants = [
      {
        name: 'The Italian Bistro',
        email: 'italian@bistro.com',
        phone: '12345678',
        categories: ['Pizza'],
      },
    ];

    // Type the mock function for `getRestaurantsByZipCode`
    const mockedGetRestaurantsByZipCode =
      restaurantService.getRestaurantsByZipCode as jest.Mock;

    // Mock the function that fetches restaurant data
    mockedGetRestaurantsByZipCode.mockResolvedValue({
      restaurants: mockFilteredRestaurants,
    });

    // Act
    const response = await supertest(app).get(`${categoryURL}${category}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFilteredRestaurants); // Check if the filtered results are returned correctly
  });

  it('should return empty result when no restaurants match the category', async () => {
    // Arrange
    const category = 'Test';

    jest
      .spyOn(restaurantService, 'getRestaurantsByZipCode')
      .mockResolvedValueOnce({ restaurants: [] });

    // Act
    const response = await supertest(app).get(`${categoryURL}${category}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
