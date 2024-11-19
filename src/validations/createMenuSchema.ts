import { z } from 'zod';

const createMenuSchema = z.object({
  title: z
    .string()
    .min(1, 'Please enter a valid title')
    .max(55, 'Title is too long'),
  description: z
    .string()
    .min(1, 'Please enter a valid description')
    .max(255, 'Description is too long'),
  price: z.number().int().min(1, 'Please enter a valid price'),
  sortOrder: z.number().int().optional(),
});

export { createMenuSchema };
