import { getRestaurantsByZipCode } from '../../services/search.service';
import { getCategoriesByRestaurantId } from '../../services/restaurant.service';
import { Restaurant } from '../../types/Restaurant';

jest.mock('../../services/restaurant.service', () => ({
  getCategoriesByRestaurantId: jest.fn(),
}));

describe('getRestaurantsByZipCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should return list of restaurants with categories when searching by zip code', async () => {
    // Arrange
    const zipCode = '1234';

    // Mock the fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        restaurants: [
          {
            id: '1',
            name: 'Test A',
            email: 'test@a.com',
            phone: '12345678',
          },
          {
            id: '2',
            name: 'Test B',
            email: 'test@b.com',
            phone: '87654321',
          },
        ],
      }),
    });

    // Mock the getCategoriesByRestaurantId response
    (getCategoriesByRestaurantId as jest.Mock)
      .mockResolvedValueOnce([{ title: 'Pizza' }, { title: 'Burger' }]) // for restaurant 1
      .mockResolvedValueOnce([{ title: 'Sushi' }, { title: 'Ramen' }]); // for restaurant 2

    // Act
    const { restaurants } = await getRestaurantsByZipCode(zipCode);

    // Assert
    expect(restaurants).toHaveLength(2);
    expect(restaurants[0]).toEqual({
      name: 'Test A',
      email: 'test@a.com',
      phone: '12345678',
      categories: ['Pizza', 'Burger'],
    });

    expect(restaurants[1]).toEqual({
      name: 'Test B',
      email: 'test@b.com',
      phone: '87654321',
      categories: ['Sushi', 'Ramen'],
    });
  });

  it('should not break down if no restaurants are located at zip code', async () => {
    // Arrange
    const zipCode = '1234';

    // Mock the fetch response to return no restaurants
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        restaurants: [], // No restaurants found
      }),
    });

    // Act
    const { restaurants } = await getRestaurantsByZipCode(zipCode);

    // Assert
    expect(restaurants).toHaveLength(0); // Ensure the restaurants list is empty
    expect(getCategoriesByRestaurantId).not.toHaveBeenCalled(); // Ensure no category
  });

  it('should throw an error if searching with invalid Danish zip code, too short', async () => {
    // Arrange
    const invalidZipCode = '123';

    // Mock fetch to ensure it is not called
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ restaurants: [] }),
    });

    // Act & Assert
    // Test if the error is thrown
    await expect(getRestaurantsByZipCode(invalidZipCode)).rejects.toThrow(
      'Invalid Danish zip code',
    );

    // Verify that fetch was not called due to the invalid zip code
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should throw an error if searching with invalid Danish zip code, too long', async () => {
    // Arrange
    const invalidZipCode = '12345';

    // Mock fetch to ensure it is not called
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ restaurants: [] }),
    });

    // Act & Assert
    await expect(getRestaurantsByZipCode(invalidZipCode)).rejects.toThrow(
      'Invalid Danish zip code',
    );

    // Verify that fetch was not called due to the invalid zip code
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should throw an error if searching with invalid Danish zip code, wrong format', async () => {
    // Arrange
    const invalidZipCode = '123A';

    // Mock fetch to ensure it is not called
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ restaurants: [] }),
    });

    // Act & Assert
    await expect(getRestaurantsByZipCode(invalidZipCode)).rejects.toThrow(
      'Invalid Danish zip code',
    );

    // Verify that fetch was not called due to the invalid zip code
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('filterRestaurantByCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should filter search result by category', async () => {
    // Arrange
    const zipCode = '1234';
    const categoryFilter = 'Pizza';

    const mockRestaurants = [
      {
        id: '1',
        name: 'The Italian Bistro',
        email: 'italian@bistro.com',
        phone: '12345678',
      },
      {
        id: '2',
        name: 'Burger House',
        email: 'burger@house.com',
        phone: '87654321',
      },
    ];

    const mockCategories: Record<string, string[]> = {
      '1': ['Pizza', 'Pasta'],
      '2': ['Burger', 'Fries'],
    };

    const expectedFilteredResults = [
      {
        name: 'The Italian Bistro',
        email: 'italian@bistro.com',
        phone: '12345678',
        categories: ['Pizza'],
      },
    ];

    // Mock `getCategoriesByRestaurantId` to return category data for each restaurant
    (getCategoriesByRestaurantId as jest.Mock).mockImplementation(
      (restaurantId: string) =>
        Promise.resolve(
          mockCategories[restaurantId].map((title: string) => ({ title })),
        ),
    );

    // Mock `fetch` to return mock restaurant data as a JSON response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        restaurants: mockRestaurants,
      }),
      status: 200,
      ok: true,
      headers: new Headers(),
      redirected: false,
    } as unknown as Response);

    // Act
    const result = await getRestaurantsByZipCode(zipCode, categoryFilter);

    // Assert
    expect(result.restaurants).toEqual(expectedFilteredResults);

    // Ensure `getCategoriesByRestaurantId` was called for each restaurant
    expect(getCategoriesByRestaurantId).toHaveBeenCalledTimes(
      mockRestaurants.length,
    );
    expect(getCategoriesByRestaurantId).toHaveBeenCalledWith('1');
    expect(getCategoriesByRestaurantId).toHaveBeenCalledWith('2');
  });

  it('should not break if category is empty', async () => {
    // Arrange
    const zipCode = '1234';
    const categoryFilter = ''; // Empty category filter

    const mockRestaurants = [
      {
        id: '1',
        name: 'The Italian Bistro',
        email: 'italian@bistro.com',
        phone: '12345678',
      },
      {
        id: '2',
        name: 'Burger House',
        email: 'burger@house.com',
        phone: '87654321',
      },
    ];

    const mockCategories: Record<string, string[]> = {
      '1': ['Pizza', 'Pasta'],
      '2': ['Burger', 'Fries'],
    };

    const expectedResults = mockRestaurants.map(restaurant => ({
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      categories: mockCategories[restaurant.id], // Add categories
    }));

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ restaurants: mockRestaurants }),
    } as unknown as Response);

    (getCategoriesByRestaurantId as jest.Mock).mockImplementation(
      (restaurantId: string) =>
        Promise.resolve(mockCategories[restaurantId].map(title => ({ title }))),
    );

    // Act
    const result = await getRestaurantsByZipCode(zipCode, categoryFilter);

    // Assert
    expect(result).toBeDefined(); // Function didn't break
    expect(result.restaurants).toEqual(expectedResults); // All restaurants are returned
    expect(global.fetch).toHaveBeenCalled();
    expect(getCategoriesByRestaurantId).toHaveBeenCalledTimes(
      mockRestaurants.length,
    );
  });

  it('should not break if category does not exist', async () => {
    // Arrange
    const zipCode = '1234';
    const categoryFilter = 'NonExistentCategory'; // This category doesn't exist in mock data

    const mockRestaurants = [
      {
        id: '1',
        name: 'The Italian Bistro',
        email: 'italian@bistro.com',
        phone: '12345678',
      },
      {
        id: '2',
        name: 'Burger House',
        email: 'burger@house.com',
        phone: '87654321',
      },
    ];

    const mockCategories: Record<string, string[]> = {
      '1': ['Pizza', 'Pasta'],
      '2': ['Burger', 'Fries'],
    };

    const expectedFilteredResults: Restaurant[] = [];

    // Mock `getCategoriesByRestaurantId` to return category data for each restaurant
    (getCategoriesByRestaurantId as jest.Mock).mockImplementation(
      (restaurantId: string) =>
        Promise.resolve(
          mockCategories[restaurantId].map((title: string) => ({ title })),
        ),
    );

    // Mock `fetch` to return mock restaurant data as a JSON response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        restaurants: mockRestaurants,
      }),
      status: 200,
      ok: true,
      headers: new Headers(),
      redirected: false,
    } as unknown as Response);

    // Act
    const result = await getRestaurantsByZipCode(zipCode, categoryFilter);

    // Assert
    expect(result.restaurants).toEqual(expectedFilteredResults);

    // Ensure `getCategoriesByRestaurantId` was called for each restaurant
    expect(getCategoriesByRestaurantId).toHaveBeenCalledTimes(
      mockRestaurants.length,
    );
    expect(getCategoriesByRestaurantId).toHaveBeenCalledWith('1');
    expect(getCategoriesByRestaurantId).toHaveBeenCalledWith('2');
  });
});
