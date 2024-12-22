import supertest from 'supertest';
import { app } from '../setup/setup';
import { createTestBasket, setTestHeaders } from '../../utils/helperMethods';

describe('Get Baskets by Id', () => {
    it('should return the basket when it exists', async () => {
        const testBasket = await createTestBasket();
        
        const testHeaders = setTestHeaders({
            role: 'CUSTOMER',
            userId: 'customer-user-id'
        })

        const response = await supertest(app)
        .get(`/api/basket/${testBasket.id}`) 
        .set(testHeaders)
        .expect(200);

        expect(response.body.basket).toMatchObject({
            id: testBasket.id,
            customerId: testBasket.customerId,
            restaurantId: testBasket.restaurantId,
            note: testBasket.note,
          });
    })

    it('should return 404 if the basket is not found', async () => {
        // Set test headers for customer
        const testHeaders = setTestHeaders({
          role: 'CUSTOMER',
          userId: 'customer-user-id',
        });
    
        // Make a request with a non-existent basket ID
        const response = await supertest(app)
          .get(`/api/basket/nonexistent-id`) // Assuming a non-existent ID
          .set(testHeaders)
          .expect(404);
    
        // Assert response
        expect(response.body).toMatchObject({
          message: 'Basket not found.',
        });
      });
})
