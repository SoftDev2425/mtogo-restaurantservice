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
      message: 'A category with this title already exists.',
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
