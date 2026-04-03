import { z } from 'zod';

export const taskParamsSchema = z.object({
  taskId: z.string().uuid(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional().default(''),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.status !== undefined,
    {
      message: 'Debes enviar al menos un campo para actualizar',
    },
  );
