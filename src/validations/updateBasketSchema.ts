import { z } from 'zod';

const updateBasketSchema = z.object({
  itemId: z.string().min(1, 'Please enter a valid title'),
  quantity: z.number().min(0, 'Please enter a valid quantity'),
  restaurantId: z.string().min(1, 'Please enter a valid restaurantId'),
});

export { updateBasketSchema };
