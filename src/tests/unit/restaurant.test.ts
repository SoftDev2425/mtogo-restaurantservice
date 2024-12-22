import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client';
import {
  createCategory,
  createMenu,
  deleteCategory,
  deleteMenu,
  getCategoriesByRestaurantId,
  getMenusByCategoryId,
  updateCategory,
  updateMenu,
} from '../../services/restaurant.service';

describe('createCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // unit test for createCategory
  it('should create a category succesfully with correct sortOrder', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.count = jest.fn().mockResolvedValue(0); // no existing categories
    prisma.categories.create = jest.fn().mockResolvedValue(mockCategory);

    // Act
    const newCategory = await createCategory(
      mockCategory.title,
      mockCategory.restaurantId,
      mockCategory.description,
    );

    // Assert
    expect(prisma.categories.count).toHaveBeenCalledTimes(1);
    expect(prisma.categories.count).toHaveBeenCalledWith({
      where: {
        restaurantId: mockCategory.restaurantId,
      },
    });
    expect(prisma.categories.create).toHaveBeenCalledTimes(1);
    expect(prisma.categories.create).toHaveBeenCalledWith({
      data: {
        title: mockCategory.title,
        description: mockCategory.description,
        restaurantId: mockCategory.restaurantId,
        sortOrder: 0,
      },
      select: {
        id: true,
        title: true,
        sortOrder: true,
        description: true,
        menus: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    expect(newCategory).toEqual(mockCategory);
  });

  it('should increment sortOrder when creating a new category', async () => {
    // Arrange
    const mockCategory = {
      id: '2',
      title: 'New Category',
      description: 'New Description',
      restaurantId: '1',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.count = jest.fn().mockResolvedValue(1); // 1 existing category
    prisma.categories.create = jest.fn().mockResolvedValue(mockCategory);

    // Act
    const newCategory = await createCategory(
      mockCategory.title,
      mockCategory.restaurantId,
      mockCategory.description,
    );

    // Assert
    expect(prisma.categories.count).toHaveBeenCalledTimes(1);
    expect(prisma.categories.count).toHaveBeenCalledWith({
      where: {
        restaurantId: mockCategory.restaurantId,
      },
    });
    expect(prisma.categories.create).toHaveBeenCalledTimes(1);
    expect(prisma.categories.create).toHaveBeenCalledWith({
      data: {
        title: mockCategory.title,
        description: mockCategory.description,
        restaurantId: mockCategory.restaurantId,
        sortOrder: 1,
      },
      select: {
        id: true,
        title: true,
        sortOrder: true,
        description: true,
        menus: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    expect(newCategory).toEqual(mockCategory);
  });

  it('should throw an error when a category with the same title already exists', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.count = jest.fn().mockResolvedValue(1); // 1 existing category
    prisma.categories.create = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        meta: {
          target: ['title'],
        },
        clientVersion: '4.0.0',
      }),
    );

    // Act and Assert
    await expect(
      createCategory(
        mockCategory.title,
        mockCategory.restaurantId,
        mockCategory.description,
      ),
    ).rejects.toThrow('Could not complete operation: title already exists.');
    expect(prisma.categories.count).toHaveBeenCalledWith({
      where: {
        restaurantId: mockCategory.restaurantId,
      },
    });
    expect(prisma.categories.create).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when an unknown error occurs', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.count = jest.fn().mockResolvedValue(1); // 1 existing category
    prisma.categories.create = jest
      .fn()
      .mockRejectedValue(
        new Error('An unexpected error occured while creating the category.'),
      );

    // Act and Assert
    await expect(
      createCategory(
        mockCategory.title,
        mockCategory.restaurantId,
        mockCategory.description,
      ),
    ).rejects.toThrow('An unexpected error occurred.');
    expect(prisma.categories.count).toHaveBeenCalledWith({
      where: {
        restaurantId: mockCategory.restaurantId,
      },
    });
    expect(prisma.categories.create).toHaveBeenCalledTimes(1);
  });
});

describe('updateCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a category successfully', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCategory = {
      ...mockCategory,
      title: 'Updated Category',
      description: 'Updated Description',
      sortOrder: 1,
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.categories.update = jest.fn().mockResolvedValue(updatedCategory);

    // Act
    const newCategory = await updateCategory(
      mockCategory.id,
      mockCategory.restaurantId,
      updatedCategory.title,
      updatedCategory.description,
      updatedCategory.sortOrder,
    );

    // Assert
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
    });
    expect(prisma.categories.update).toHaveBeenCalledTimes(1);
    expect(prisma.categories.update).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
      data: {
        title: updatedCategory.title,
        description: updatedCategory.description,
        sortOrder: updatedCategory.sortOrder,
        restaurantId: mockCategory.restaurantId,
      },
      select: {
        id: true,
        title: true,
        sortOrder: true,
        description: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    expect(newCategory).toEqual(updatedCategory);
  });

  it('should throw an error when a category with the same title already exists', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCategory = {
      ...mockCategory,
      title: 'Updated Category',
      description: 'Updated Description',
      sortOrder: 1,
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.categories.update = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        meta: {
          target: ['title'],
        },
        clientVersion: '4.0.0',
      }),
    );

    // Act and Assert
    await expect(
      updateCategory(
        mockCategory.id,
        mockCategory.restaurantId,
        updatedCategory.title,
        updatedCategory.description,
        updatedCategory.sortOrder,
      ),
    ).rejects.toThrow('Could not complete operation: title already exists.');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.update).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the category is not found', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCategory = {
      ...mockCategory,
      title: 'Updated Category',
      description: 'Updated Description',
      sortOrder: 1,
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(null);

    // Act and Assert
    await expect(
      updateCategory(
        mockCategory.id,
        mockCategory.restaurantId,
        updatedCategory.title,
        updatedCategory.description,
        updatedCategory.sortOrder,
      ),
    ).rejects.toThrow(
      'Category not found or does not belong to the restaurant.',
    );
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when an unknown error occurs', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCategory = {
      ...mockCategory,
      title: 'Updated Category',
      description: 'Updated Description',
      sortOrder: 1,
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.categories.update = jest
      .fn()
      .mockRejectedValue(
        new Error('An unexpected error occured while updating the category.'),
      );

    // Act and Assert
    await expect(
      updateCategory(
        mockCategory.id,
        mockCategory.restaurantId,
        updatedCategory.title,
        updatedCategory.description,
        updatedCategory.sortOrder,
      ),
    ).rejects.toThrow('An unexpected error occurred.');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.update).toHaveBeenCalledTimes(1);
  });

  it('should successfully update a category when sortOrder remains the same', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCategory = {
      ...mockCategory,
      title: 'Updated Category',
      description: 'Updated Description',
      sortOrder: 0,
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.categories.update = jest.fn().mockResolvedValue(updatedCategory);

    // Act
    const newCategory = await updateCategory(
      mockCategory.id,
      mockCategory.restaurantId,
      updatedCategory.title,
      updatedCategory.description,
      updatedCategory.sortOrder,
    );

    // Assert
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
    });
    expect(prisma.categories.update).toHaveBeenCalledTimes(1);
    expect(prisma.categories.update).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
      data: {
        title: updatedCategory.title,
        description: updatedCategory.description,
        sortOrder: updatedCategory.sortOrder,
        restaurantId: updatedCategory.restaurantId,
      },
      select: {
        id: true,
        title: true,
        sortOrder: true,
        description: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    expect(newCategory).toEqual(updatedCategory);
  });
});

describe('deleteCategory', () => {
  it('should delete a category successfully when it exists and restaurantId matches', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.categories.delete = jest.fn().mockResolvedValue(mockCategory);

    // Act
    await deleteCategory(mockCategory.id, mockCategory.restaurantId);

    // Assert
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
    });
    expect(prisma.categories.delete).toHaveBeenCalledTimes(1);
    expect(prisma.categories.delete).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
    });
  });

  it('should throw an error when the category is not found', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(null);

    // Act and Assert
    await expect(
      deleteCategory(mockCategory.id, mockCategory.restaurantId),
    ).rejects.toThrow('Category not found');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the category does not belong to the restaurant', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue({
      ...mockCategory,
      restaurantId: '2',
    });

    // Act and Assert
    await expect(
      deleteCategory(mockCategory.id, mockCategory.restaurantId),
    ).rejects.toThrow('Category not found');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when an unknown error occurs', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest
      .fn()
      .mockRejectedValue(new Error('Unknown error'));

    // Act and Assert
    await expect(
      deleteCategory(mockCategory.id, mockCategory.restaurantId),
    ).rejects.toThrow('Unknown error');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe('createMenu', () => {
  it('should create a menu successfully', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMenu = {
      id: '1',
      title: 'Mock Menu',
      description: 'Mock Description',
      price: 129,
      categoryId: mockCategory.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.menus.count = jest.fn().mockResolvedValue(0);
    prisma.menus.create = jest.fn().mockResolvedValue(mockMenu);

    // Act
    const newMenu = await createMenu(
      mockMenu.title,
      mockMenu.description,
      mockMenu.price,
      mockCategory.id,
      mockCategory.restaurantId,
    );

    // Assert

    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
    });
    expect(prisma.menus.create).toHaveBeenCalledTimes(1);
    expect(prisma.menus.create).toHaveBeenCalledWith({
      data: {
        title: mockMenu.title,
        description: mockMenu.description,
        price: mockMenu.price,
        category: {
          connect: {
            id: mockCategory.id,
          },
        },
      },
    });
    expect(newMenu).toEqual(mockMenu);
  });

  it('should throw an error when the category is not found', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMenu = {
      id: '1',
      title: 'Mock Menu',
      description: 'Mock Description',
      price: 129,
      categoryId: mockCategory.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(null);

    // Act and Assert
    await expect(
      createMenu(
        mockMenu.title,
        mockMenu.description,
        mockMenu.price,
        mockCategory.id,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('Category not found');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the category does not belong to the restaurant', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '2',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMenu = {
      id: '1',
      title: 'Mock Menu',
      description: 'Mock Description',
      price: 129,
      sortOrder: 0,
      categoryId: mockCategory.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue({
      ...mockCategory,
      restaurantId: '1',
    });

    // Act and Assert
    await expect(
      createMenu(
        mockMenu.title,
        mockMenu.description,
        mockMenu.price,
        mockCategory.id,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('Category not found');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when an unknown error occurs', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '2',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMenu = {
      id: '1',
      title: 'Mock Menu',
      description: 'Mock Description',
      price: 129,
      sortOrder: 0,
      categoryId: mockCategory.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest
      .fn()
      .mockRejectedValue(new Error('Unknown error'));

    // Act and Assert
    await expect(
      createMenu(
        mockMenu.title,
        mockMenu.description,
        mockMenu.price,
        mockCategory.id,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('Unknown error');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if a menu with the same title already exists in the category', async () => {
    // Arrange
    const mockCategory = {
      id: '1',
      title: 'Mock Category',
      description: 'Mock Description',
      restaurantId: '1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMenu = {
      id: '1',
      title: 'Mock Menu',
      description: 'Mock Description',
      price: 129,
      categoryId: mockCategory.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.menus.create = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        meta: {
          target: ['title'],
        },
        clientVersion: '4.0.0',
      }),
    );

    // Act and Assert
    await expect(
      createMenu(
        mockMenu.title,
        mockMenu.description,
        mockMenu.price,
        mockCategory.id,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('Could not complete operation: title already exists.');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.menus.create).toHaveBeenCalledTimes(1);
  });
});

describe('updateMenu', () => {
  it("should update a menu successfully when it exists and the category's restaurantId matches", async () => {
    // Arrange
    const mockMenu = {
      id: 'menu1',
      title: 'Original Menu',
      description: 'Original Description',
      price: 100,
      category: {
        id: 'category1',
        restaurantId: 'restaurant1',
      },
    };

    prisma.menus.findUnique = jest.fn().mockResolvedValue(mockMenu);
    prisma.menus.update = jest.fn().mockResolvedValue({
      id: 'menu1',
      title: 'Updated Menu',
      description: 'Updated Description',
      price: 120,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedMenu = await updateMenu(
      mockMenu.id,
      'Updated Menu',
      'Updated Description',
      120,
      'restaurant1',
    );

    expect(updatedMenu).toMatchObject({
      id: 'menu1',
      title: 'Updated Menu',
      description: 'Updated Description',
      price: 120,
    });
    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.menus.update).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the menu is not found', async () => {
    prisma.menus.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      updateMenu(
        'menu1',
        'Updated Menu',
        'Updated Description',
        120,
        'restaurant1',
      ),
    ).rejects.toThrow('Menu not found or does not belong to the restaurant.');

    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the category does not belong to the restaurant', async () => {
    prisma.menus.findUnique = jest.fn().mockResolvedValue({
      id: 'menu1',
      title: 'Original Menu',
      description: 'Original Description',
      price: 100,
      sortOrder: 0,
      category: {
        id: 'category1',
        restaurantId: 'restaurant2',
      },
    });

    await expect(
      updateMenu(
        'menu1',
        'Updated Menu',
        'Updated Description',
        120,
        'restaurant1',
      ),
    ).rejects.toThrow('Menu not found or does not belong to the restaurant.');

    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
  });

  it("should update a menu's sortOrder successfully", async () => {
    const mockMenu = {
      id: 'menu1',
      title: 'Original Menu',
      description: 'Original Description',
      price: 100,
      sortOrder: 0,
      category: {
        id: 'category1',
        restaurantId: 'restaurant1',
      },
    };

    prisma.menus.findUnique = jest.fn().mockResolvedValue(mockMenu);
    prisma.menus.update = jest.fn().mockResolvedValue({
      id: 'menu1',
      title: 'Original Menu',
      description: 'Original Description',
      price: 100,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedMenu = await updateMenu(
      mockMenu.id,
      'Original Menu',
      'Original Description',
      100,
      'restaurant1',
    );

    expect(updatedMenu).toMatchObject({
      id: 'menu1',
      title: 'Original Menu',
      description: 'Original Description',
      price: 100,
      sortOrder: 1,
    });
    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.menus.update).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when updating a menu's title to an existing title in the category", async () => {
    const mockMenu = {
      id: 'menu1',
      title: 'Original Menu',
      description: 'Original Description',
      price: 100,
      sortOrder: 0,
      category: {
        id: 'category1',
        restaurantId: 'restaurant1',
      },
    };

    prisma.menus.findUnique = jest.fn().mockResolvedValue(mockMenu);
    prisma.menus.update = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        meta: {
          target: ['title'],
        },
        clientVersion: '4.0.0',
      }),
    );

    await expect(
      updateMenu(
        'menu1',
        'Original Menu',
        'Original Description',
        100,
        'restaurant1',
      ),
    ).rejects.toThrow('Could not complete operation: title already exists.');

    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.menus.update).toHaveBeenCalledTimes(1);
  });
});

describe('deleteMenu', () => {
  it('should delete a menu successfully and adjust the sortOrder of the remaining menus in the category', async () => {
    const mockMenu = {
      id: 'menu1',
      category: {
        id: 'category1',
        restaurantId: 'restaurant1',
      },
    };

    prisma.menus.findUnique = jest.fn().mockResolvedValue(mockMenu);
    prisma.menus.delete = jest.fn().mockResolvedValue(mockMenu);

    await expect(deleteMenu('menu1', 'restaurant1')).resolves.not.toThrow();

    // Assertions
    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.menus.findUnique).toHaveBeenCalledWith({
      where: { id: 'menu1' },
      select: {
        category: {
          select: {
            restaurantId: true,
          },
        },
      },
    });

    expect(prisma.menus.delete).toHaveBeenCalledTimes(1);
    expect(prisma.menus.delete).toHaveBeenCalledWith({
      where: { id: 'menu1' },
    });
  });

  it('should throw an error when the menu is not found', async () => {
    prisma.menus.findUnique = jest.fn().mockResolvedValue(null);

    await expect(deleteMenu('menu1', 'restaurant1')).rejects.toThrow(
      'Menu not found or does not belong to the restaurant.',
    );

    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the category does not belong to the restaurant', async () => {
    prisma.menus.findUnique = jest.fn().mockResolvedValue({
      id: 'menu1',
      category: {
        id: 'category1',
        restaurantId: 'restaurant2',
      },
    });

    await expect(deleteMenu('menu1', 'restaurant1')).rejects.toThrow(
      'Menu not found or does not belong to the restaurant.',
    );

    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when an unknown error occurs', async () => {
    prisma.menus.findUnique = jest.fn().mockRejectedValue(new Error('Unknown'));

    await expect(deleteMenu('menu1', 'restaurant1')).rejects.toThrow('Unknown');

    expect(prisma.menus.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe('getMenusByCategoryId', () => {
  it('should return an array of menus when they exist', async () => {
    const mockMenus = [
      {
        id: 'menu1',
        title: 'Menu 1',
        description: 'Description 1',
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'menu2',
        title: 'Menu 2',
        description: 'Description 2',
        price: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prisma.menus.findMany = jest.fn().mockResolvedValue(mockMenus);

    const menus = await getMenusByCategoryId('category1');

    expect(menus).toEqual(mockMenus);
    expect(prisma.menus.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.menus.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'category1' },
    });
  });

  it('should return an empty array when no menus exist', async () => {
    prisma.menus.findMany = jest.fn().mockResolvedValue([]);

    const menus = await getMenusByCategoryId('category1');

    expect(menus).toEqual([]);
    expect(prisma.menus.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.menus.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'category1' },
    });
  });

  it('should throw an error when an unknown error occurs', async () => {
    prisma.menus.findMany = jest.fn().mockRejectedValue(new Error('Unknown'));

    await expect(getMenusByCategoryId('category1')).rejects.toThrow('Unknown');

    expect(prisma.menus.findMany).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the category is not found', async () => {
    prisma.menus.findMany = jest.fn().mockRejectedValue(new Error('Unknown'));

    await expect(getMenusByCategoryId('category1')).rejects.toThrow('Unknown');

    expect(prisma.menus.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('getCategoriesByRestaurantId', () => {
  it('should return an array of categories when they exist', async () => {
    const mockCategories = [
      {
        id: 'category1',
        title: 'Category 1',
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'category2',
        title: 'Category 2',
        description: 'Description 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prisma.categories.findMany = jest.fn().mockResolvedValue(mockCategories);

    const categories = await getCategoriesByRestaurantId('restaurant1');

    expect(categories).toEqual(mockCategories);
    expect(prisma.categories.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findMany).toHaveBeenCalledWith({
      where: { restaurantId: 'restaurant1' },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        restaurantId: true,
        sortOrder: true,
        createdAt: true,
        menus: true,
      },
    });
  });

  it('should return an empty array when no categories exist', async () => {
    prisma.categories.findMany = jest.fn().mockResolvedValue([]);

    const categories = await getCategoriesByRestaurantId('restaurant1');

    expect(categories).toEqual([]);
    expect(prisma.categories.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findMany).toHaveBeenCalledWith({
      where: { restaurantId: 'restaurant1' },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        restaurantId: true,
        sortOrder: true,
        createdAt: true,
        menus: true,
      },
    });
  });

  it('should throw an error when an unknown error occurs', async () => {
    prisma.categories.findMany = jest
      .fn()
      .mockRejectedValue(new Error('Unknown'));

    await expect(getCategoriesByRestaurantId('restaurant1')).rejects.toThrow(
      'Unknown',
    );

    expect(prisma.categories.findMany).toHaveBeenCalledTimes(1);
  });
});
