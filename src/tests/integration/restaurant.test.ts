import supertest from 'supertest';
import { app } from '../setup/setup';
import { createTestCategory, setTestHeaders } from '../../utils/helperMethods';
import prisma from '../../../prisma/client';

describe('Restaurant create category', () => {
  it('should create a new category for a restaurant', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: 'Pizza',
        description: 'Our pizza category has delicious pizzas',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Category created successfully',
      category: {
        title: 'Pizza',
        description: 'Our pizza category has delicious pizzas',
        createdAt: expect.any(String),
      },
    });

    const category = await prisma.categories.findFirst({
      where: {
        title: 'Pizza',
        restaurantId: 'restaurant-user-id',
      },
    });

    expect(category).toBeTruthy();
  });

  it('should not allow customers to create a category', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: 'Burgers',
        description: 'Our burger category has delicious burgers',
      })
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    // Ensuring no category was created
    const categories = await prisma.categories.findMany();
    expect(categories).toHaveLength(0);
  });

  it('should return validation errors for invalid inputs', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: '',
        description: '',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      errors: [
        {
          field: 'title',
          message: 'Please enter a valid title',
        },
        {
          field: 'description',
          message: 'Please enter a valid description',
        },
      ],
    });

    // Ensuring no category was created
    const categories = await prisma.categories.findMany();
    expect(categories).toHaveLength(0);
  });

  it('should return validation error if title exceeds maximum length of 55 characters', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: 'Pizza'.repeat(20),
        description: 'Our pizza category has delicious pizzas',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      errors: [
        {
          field: 'title',
          message: 'Title is too long',
        },
      ],
    });

    // Ensuring no category was created
    const categories = await prisma.categories.findMany();
    expect(categories).toHaveLength(0);
  });

  it('should create a category without a description', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: 'Category without description',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Category created successfully',
      category: {
        title: 'Category without description',
        description: '',
        sortOrder: 0,
        createdAt: expect.any(String),
      },
    });

    const category = await prisma.categories.findFirst({
      where: {
        title: 'Category without description',
        restaurantId: 'restaurant-user-id',
      },
    });

    expect(category).toBeTruthy();
  });

  it('should not allow duplicate category titles for a restaurant', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: testCategory.title,
        description: testCategory.description,
      })
      .expect(400);

    expect(response.body).toMatchObject({
      message:
        'Could not creating category with this title because title already exists.',
    });
  });

  it('should correctly calculate sortOrder for multiple categories', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    await createTestCategory();
    await createTestCategory();

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: 'New Category',
        description: 'New Category Description',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Category created successfully',
      category: {
        title: 'New Category',
        description: 'New Category Description',
        sortOrder: 2,
        createdAt: expect.any(String),
      },
    });

    const category = await prisma.categories.findFirst({
      where: {
        title: 'New Category',
        restaurantId: 'restaurant-user-id',
      },
    });

    expect(category).toBeTruthy();
    expect(category?.sortOrder).toBe(2);
  });
});

describe('Restaurant update category', () => {
  it('should update a category for a restaurant', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .put(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .send({
        title: 'Updated Title',
        description: 'New Description',
        sortOrder: 5,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Category updated successfully',
      category: {
        title: 'Updated Title',
        description: 'New Description',
        sortOrder: 5,
        createdAt: expect.any(String),
      },
    });

    const updatedCategory = await prisma.categories.findFirst({
      where: {
        id: testCategory.id,
      },
    });

    expect(updatedCategory).toMatchObject({
      title: 'Updated Title',
      description: 'New Description',
      sortOrder: 5,
    });
  });

  it('should not allow customers to update a category', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .put(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .send({
        title: 'New Title',
        description: 'New Description',
        sortOrder: 5,
      })
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    // Ensuring category was not updated
    const updatedCategory = await prisma.categories.findFirst({
      where: {
        id: testCategory.id,
      },
    });

    expect(updatedCategory).toMatchObject({
      title: testCategory.title,
      description: testCategory.description,
      sortOrder: testCategory.sortOrder,
    });
  });

  it('should return validation errors for invalid inputs', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .put(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .send({
        title: '',
        description: '',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      errors: [
        {
          field: 'title',
          message: 'Please enter a valid title',
        },
        {
          field: 'description',
          message: 'Please enter a valid description',
        },
      ],
    });

    // Ensuring category was not updated
    const updatedCategory = await prisma.categories.findFirst({
      where: {
        id: testCategory.id,
      },
    });

    expect(updatedCategory).toMatchObject({
      title: testCategory.title,
      description: testCategory.description,
      sortOrder: testCategory.sortOrder,
    });
  });

  it('should return validation error if title exceeds maximum length of 55 characters', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .put(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .send({
        title: 'New Title'.repeat(20),
        description: 'New Description',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      errors: [
        {
          field: 'title',
          message: 'Title is too long',
        },
      ],
    });

    // Ensuring category was not updated
    const updatedCategory = await prisma.categories.findFirst({
      where: {
        id: testCategory.id,
      },
    });

    expect(updatedCategory).toMatchObject({
      title: testCategory.title,
      description: testCategory.description,
      sortOrder: testCategory.sortOrder,
    });
  });

  it('should not allow updating a category with a duplicate title', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();
    const duplicateCategory = await createTestCategory();

    const response = await supertest(app)
      .put(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .send({
        title: duplicateCategory.title,
        description: 'New Description',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'A category with this title already exists.',
    });

    // Ensuring category was not updated
    const updatedCategory = await prisma.categories.findFirst({
      where: {
        id: testCategory.id,
      },
    });

    expect(updatedCategory).toMatchObject({
      title: testCategory.title,
      description: testCategory.description,
      sortOrder: testCategory.sortOrder,
    });
  });

  it('should not allow updating a category that does not belong to the restaurant', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id2',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .put(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .send({
        title: 'New Title',
        description: 'New Description',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Category not found or does not belong to the restaurant.',
    });
  });

  it('should handle optional description and edge cases', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    // Pre-create a category
    const category = await prisma.categories.create({
      data: {
        title: 'Sides',
        description: 'Accompaniments',
        restaurantId: 'restaurant-user-id',
        sortOrder: 1,
      },
    });

    // Update with no description
    const response1 = await supertest(app)
      .put(`/api/restaurants/categories/${category.id}`)
      .set(testHeaders)
      .send({ title: 'Updated Sides' })
      .expect(200);

    expect(response1.body.category).toMatchObject({
      title: 'Updated Sides',
      description: 'Accompaniments',
    });

    // Update sortOrder to zero
    const response2 = await supertest(app)
      .put(`/api/restaurants/categories/${category.id}`)
      .set(testHeaders)
      .send({ sortOrder: 0 })
      .expect(200);

    expect(response2.body.category.sortOrder).toBe(0);
  });

  it('should return an error for an invalid category ID', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .put(`/api/restaurants/categories/invalid-id`)
      .set(testHeaders)
      .send({ title: 'Updated Title' })
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Category not found or does not belong to the restaurant.',
    });
  });
});

describe('Restaurant delete category', () => {
  it('should delete a category for a restaurant successfully', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    await supertest(app)
      .delete(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .expect(200);

    const deletedCategory = await prisma.categories.findFirst({
      where: {
        id: testCategory.id,
      },
    });

    expect(deletedCategory).toBeFalsy();
  });

  it('should not allow customers to delete a category', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .delete(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    const category = await prisma.categories.findFirst({
      where: {
        id: testCategory.id,
      },
    });

    expect(category).toBeTruthy();
  });

  it('should not allow deleting a category that does not belong to the restaurant', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id2',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .delete(`/api/restaurants/categories/${testCategory.id}`)
      .set(testHeaders)
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Category not found or does not belong to the restaurant.',
    });
  });

  it('should return an error for an invalid category ID', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .delete(`/api/restaurants/categories/invalid-id`)
      .set(testHeaders)
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Category not found or does not belong to the restaurant.',
    });
  });

  it('should return an error for a non-existent category ID', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .delete('/api/restaurants/categories/invalid-id')
      .set(testHeaders)
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Category not found or does not belong to the restaurant.',
    });
  });

  it('should return an unauthorized error if no headers are provided', async () => {
    const category = await prisma.categories.create({
      data: {
        title: 'Sides',
        description: 'Accompaniments',
        restaurantId: 'restaurant-user-id',
        sortOrder: 4,
      },
    });

    const response = await supertest(app)
      .delete(`/api/restaurants/categories/${category.id}`)
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    const existingCategory = await prisma.categories.findUnique({
      where: { id: category.id },
    });
    expect(existingCategory).not.toBeNull();
  });
});

describe('Get categories by restaurant ID', () => {
  it('should retrieve all categories for the given restaurant', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    // Pre-create categories for the restaurant
    const restaurantId = 'restaurant-test-id';
    await prisma.categories.createMany({
      data: [
        {
          title: 'Appetizers',
          description: 'Starter dishes',
          restaurantId,
          sortOrder: 0,
        },
        {
          title: 'Mains',
          description: 'Main course',
          restaurantId,
          sortOrder: 1,
        },
      ],
    });

    const response = await supertest(app)
      .get(`/api/restaurants/${restaurantId}/categories`)
      .set(testHeaders)
      .expect(200);

    expect(response.body.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Appetizers',
          description: 'Starter dishes',
          sortOrder: 0,
        }),
        expect.objectContaining({
          title: 'Mains',
          description: 'Main course',
          sortOrder: 1,
        }),
      ]),
    );
  });

  it('should return an empty array if no categories are found', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const response = await supertest(app)
      .get('/api/restaurants/restaurant-id/categories')
      .set(testHeaders)
      .expect(200);

    expect(response.body.categories).toEqual([]);
  });
});

describe('Create menu', () => {
  it('should create a new menu for a category successfully for a restaurant', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .post(`/api/restaurants/categories/${testCategory.id}/menus`)
      .set(testHeaders)
      .send({
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Menu created successfully',
      menu: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        createdAt: expect.any(String),
      },
    });

    const menu = await prisma.menus.findFirst({
      where: {
        title: 'Margherita Pizza',
        categoryId: testCategory.id,
      },
    });

    expect(menu).toBeTruthy();
  });

  it('should fail creating a menu for users without restaurant role', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .post(`/api/restaurants/categories/${testCategory.id}/menus`)
      .set(testHeaders)
      .send({
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
      })
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    const menu = await prisma.menus.findFirst({
      where: {
        title: 'Margherita Pizza',
        categoryId: testCategory.id,
      },
    });

    expect(menu).toBeFalsy();
  });

  it('should return validation errors for invalid inputs when creating a menu', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .post(`/api/restaurants/categories/${testCategory.id}/menus`)
      .set(testHeaders)
      .send({
        title: '',
        description: '',
        price: -1,
      })
      .expect(400);

    expect(response.body).toMatchObject({
      errors: [
        {
          field: 'title',
          message: 'Please enter a valid title',
        },
        {
          field: 'description',
          message: 'Please enter a valid description',
        },
        {
          field: 'price',
          message: 'Please enter a valid price',
        },
      ],
    });

    const menu = await prisma.menus.findFirst({
      where: {
        categoryId: testCategory.id,
      },
    });

    expect(menu).toBeFalsy();
  });

  it('should handle boundary values', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const response = await supertest(app)
      .post(`/api/restaurants/categories/${testCategory.id}/menus`)
      .set(testHeaders)
      .send({
        title: 'A'.repeat(55), // Testing maximum allowed length
        description: 'B'.repeat(255), // Testing maximum allowed length
        price: 200,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Menu created successfully',
      menu: {
        id: expect.any(String),
        title: 'A'.repeat(55),
        description: 'B'.repeat(255),
        price: 200,
        createdAt: expect.any(String),
      },
    });
  });
});

describe('Update menu', () => {
  it('should update a menu for a restaurant successfully', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const testMenu = await prisma.menus.create({
      data: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        categoryId: testCategory.id,
      },
    });

    const response = await supertest(app)
      .put(`/api/restaurants/menus/${testMenu.id}`)
      .set(testHeaders)
      .send({
        title: 'Updated Margherita Pizza',
        description: 'Updated Margherita pizza',
        price: 12,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Menu updated successfully',
      menu: {
        title: 'Updated Margherita Pizza',
        description: 'Updated Margherita pizza',
        price: 12,
        createdAt: expect.any(String),
      },
    });

    const updatedMenu = await prisma.menus.findFirst({
      where: {
        id: testMenu.id,
      },
    });

    expect(updatedMenu).toMatchObject({
      title: 'Updated Margherita Pizza',
      description: 'Updated Margherita pizza',
      price: 12,
    });
  });

  it('should not allow customers to update a menu', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const testCategory = await createTestCategory();

    const testMenu = await prisma.menus.create({
      data: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        categoryId: testCategory.id,
      },
    });

    const response = await supertest(app)
      .put(`/api/restaurants/menus/${testMenu.id}`)
      .set(testHeaders)
      .send({
        title: 'Updated Margherita Pizza',
        description: 'Updated Margherita pizza',
        price: 12,
      })
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    const updatedMenu = await prisma.menus.findFirst({
      where: {
        id: testMenu.id,
      },
    });

    expect(updatedMenu).toMatchObject({
      title: 'Margherita Pizza',
      description: 'Classic Margherita pizza',
      price: 10,
    });
  });

  it('should return validation errors for invalid inputs when updating a menu', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const testMenu = await prisma.menus.create({
      data: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        categoryId: testCategory.id,
      },
    });

    const response = await supertest(app)
      .put(`/api/restaurants/menus/${testMenu.id}`)
      .set(testHeaders)
      .send({
        title: '',
        description: '',
        price: -1,
      })
      .expect(400);

    expect(response.body).toMatchObject({
      errors: [
        {
          field: 'title',
          message: 'Please enter a valid title',
        },
        {
          field: 'description',
          message: 'Please enter a valid description',
        },
        {
          field: 'price',
          message: 'Please enter a valid price',
        },
      ],
    });

    const updatedMenu = await prisma.menus.findFirst({
      where: {
        id: testMenu.id,
      },
    });

    expect(updatedMenu).toMatchObject({
      title: 'Margherita Pizza',
      description: 'Classic Margherita pizza',
      price: 10,
    });
  });
});

describe('Delete menu', () => {
  it('should delete a menu for a restaurant successfully', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const testCategory = await createTestCategory();

    const testMenu = await prisma.menus.create({
      data: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        categoryId: testCategory.id,
      },
    });

    await supertest(app)
      .delete(`/api/restaurants/menus/${testMenu.id}`)
      .set(testHeaders)
      .expect(200);

    const deletedMenu = await prisma.menus.findFirst({
      where: {
        id: testMenu.id,
      },
    });

    expect(deletedMenu).toBeFalsy();
  });

  it('should not allow customers to delete a menu', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const testCategory = await createTestCategory();

    const testMenu = await prisma.menus.create({
      data: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        categoryId: testCategory.id,
      },
    });

    const response = await supertest(app)
      .delete(`/api/restaurants/menus/${testMenu.id}`)
      .set(testHeaders)
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    const menu = await prisma.menus.findFirst({
      where: {
        id: testMenu.id,
      },
    });

    expect(menu).toBeTruthy();
  });

  it('should return an error for an invalid menu ID', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
      userId: 'restaurant-user-id',
    });

    const response = await supertest(app)
      .delete(`/api/restaurants/menus/invalid-id`)
      .set(testHeaders)
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Menu not found or does not belong to the restaurant.',
    });
  });

  it('should return an unauthorized error if no headers are provided', async () => {
    const testCategory = await createTestCategory();

    const menu = await prisma.menus.create({
      data: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        categoryId: testCategory.id,
      },
    });

    const response = await supertest(app)
      .delete(`/api/restaurants/menus/${menu.id}`)
      .expect(403);

    expect(response.body).toMatchObject({
      message: 'You are not authorized to perform this action.',
    });

    const existingMenu = await prisma.menus.findUnique({
      where: { id: menu.id },
    });
    expect(existingMenu).not.toBeNull();
  });
});

describe('Get menu by id', () => {
  it('should retrieve a menu by ID successfully', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const testCategory = await createTestCategory();

    const testMenu = await prisma.menus.create({
      data: {
        title: 'Margherita Pizza',
        description: 'Classic Margherita pizza',
        price: 10,
        categoryId: testCategory.id,
      },
    });

    const response = await supertest(app)
      .get(`/api/restaurants/menus/${testMenu.id}`)
      .set(testHeaders)
      .expect(200);

    expect(response.body.menu).toMatchObject({
      title: 'Margherita Pizza',
      description: 'Classic Margherita pizza',
      price: 10,
    });
  });

  it('should return an error for an invalid menu ID', async () => {
    const testHeaders = setTestHeaders({
      role: 'CUSTOMER',
      userId: 'customer-user-id',
    });

    const response = await supertest(app)
      .get('/api/restaurants/menus/invalid-id')
      .set(testHeaders)
      .expect(404);

    expect(response.body).toMatchObject({
      message: 'Menu not found.',
    });
  });
});
