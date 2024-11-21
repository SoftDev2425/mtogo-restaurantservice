import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client';
import {
  createCategory,
  createMenu,
  deleteCategory,
  updateCategory,
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
      mockCategory.description,
      mockCategory.restaurantId,
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
      mockCategory.description,
      mockCategory.restaurantId,
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
        mockCategory.description,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('A category with this title already exists.');
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
      .mockRejectedValue(new Error('Unknown error'));

    // Act and Assert
    await expect(
      createCategory(
        mockCategory.title,
        mockCategory.description,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('Unknown error');
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
      updatedCategory.title,
      updatedCategory.description,
      updatedCategory.sortOrder,
      mockCategory.restaurantId,
    );

    // Assert
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
      select: {
        restaurantId: true,
        sortOrder: true,
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
        updatedCategory.title,
        updatedCategory.description,
        updatedCategory.sortOrder,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('A category with this title already exists.');
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
        updatedCategory.title,
        updatedCategory.description,
        updatedCategory.sortOrder,
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
      .mockRejectedValue(new Error('Unknown error'));

    // Act and Assert
    await expect(
      updateCategory(
        mockCategory.id,
        updatedCategory.title,
        updatedCategory.description,
        updatedCategory.sortOrder,
        mockCategory.restaurantId,
      ),
    ).rejects.toThrow('Unknown error');
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
      updatedCategory.title,
      updatedCategory.description,
      updatedCategory.sortOrder,
      mockCategory.restaurantId,
    );

    // Assert
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.categories.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockCategory.id,
      },
      select: {
        restaurantId: true,
        sortOrder: true,
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
    expect(prisma.menus.count).toHaveBeenCalledTimes(1);
    expect(prisma.menus.count).toHaveBeenCalledWith({
      where: {
        categoryId: mockCategory.id,
      },
    });
    expect(prisma.menus.create).toHaveBeenCalledTimes(1);
    expect(prisma.menus.create).toHaveBeenCalledWith({
      data: {
        title: mockMenu.title,
        description: mockMenu.description,
        price: mockMenu.price,
        sortOrder: 0,
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
      sortOrder: 0,
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
      sortOrder: 0,
      categoryId: mockCategory.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
    prisma.menus.count = jest.fn().mockResolvedValue(1);
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
    ).rejects.toThrow('A menu with this title already exists.');
    expect(prisma.categories.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.menus.count).toHaveBeenCalledTimes(1);
    expect(prisma.menus.create).toHaveBeenCalledTimes(1);
  });
});
