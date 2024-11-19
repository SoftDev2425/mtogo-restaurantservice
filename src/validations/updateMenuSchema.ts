import { z } from 'zod';

const updateMenuSchema = z.object({
  title: z
    .string()
    .min(1, 'Please enter a valid title')
    .max(55, 'Title is too long')
    .optional(),
  description: z
    .string()
    .min(1, 'Please enter a valid description')
    .max(255, 'Description is too long')
    .optional(),
  price: z.number().int().min(1, 'Please enter a valid price').optional(),
  sortOrder: z.number().int().optional(),
});

export { updateMenuSchema };
