import { getRestaurantsByZipCode } from '../../services/search.service';
import { getCategoriesByRestaurantId } from '../../services/restaurant.service';

jest.mock('../../services/restaurant.service', () => ({
  getCategoriesByRestaurantId: jest.fn(),
}));

global.fetch = jest.fn();

describe('getRestaurantsByZipCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it.only('should throw an error if searching with invalid Danish zip code, wrong format', async () => {
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
