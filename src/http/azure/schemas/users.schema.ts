import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export const userExistsQuerySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});
