import { z } from 'zod';

const addToBasketSchema = z.object({
  menuId: z.string().min(1, 'Please enter a valid menu ID'),
  title: z.string().min(1, 'Please enter a valid title'),
  quantity: z
    .number()
    .int()
    .min(0, 'Please enter a valid quantity of 0 or more'),
  restaurantId: z.string().min(1, 'Please enter a valid restaurant ID'),
});

export { addToBasketSchema };
