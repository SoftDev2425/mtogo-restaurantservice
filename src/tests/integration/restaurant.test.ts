import supertest from 'supertest';
import { app } from '../setup/setup';
import { setTestHeaders } from '../../utils/helperMethods';

describe('Restaurant create category', () => {
  it('should create a new category', async () => {
    const testHeaders = setTestHeaders({
      role: 'RESTAURANT',
    });

    const response = await supertest(app)
      .post('/api/restaurants/categories')
      .set(testHeaders)
      .send({
        title: 'Pizza',
        description: 'Pizza category',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Category created successfully',
      category: {
        title: 'Pizza',
        description: 'Pizza category',
        sortOrder: 0,
      },
    });
  });

  // it('should return 400 if title is missing', async () => {
  //   const response = await supertest(app)
  //     .post('/restaurant/categories')
  //     .send({
  //       description: 'Pizza category',
  //       sortOrder: 1,
  //     })
  //     .expect(400);

  //   expect(response.body).toMatchObject({
  //     errors: [
  //       {
  //         field: 'title',
  //         message: 'This field is required',
  //       },
  //     ],
  //   });
  // });

  // it('should return 400 if description is missing', async () => {
  //   const response = await supertest(app)
  //     .post('/restaurant/categories')
  //     .send({
  //       title: 'Pizza',
  //       sortOrder: 1,
  //     })
  //     .expect(400);

  //   expect(response.body).toMatchObject({
  //     errors: [
  //       {
  //         field: 'description',
  //         message: 'This field is required',
  //       },
  //     ],
  //   });
  // });

  // it('should return 400 if sortOrder is missing', async () => {
  //   const response = await supertest(app)
  //     .post('/restaurant/categories')
  //     .send({
  //       title: 'Pizza',
  //       description: 'Pizza category',
  //     })
  //     .expect(400);

  //   expect(response.body).toMatchObject({
  //     errors: [
  //       {
  //         field: 'sortOrder',
  //         message: 'This field is required',
  //       },
  //     ],
  //   });
  // });
});
