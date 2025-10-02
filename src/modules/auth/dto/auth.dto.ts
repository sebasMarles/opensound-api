import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters');

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema,
    name: z.string().min(2).max(100),
    avatar: z.string().url().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
});

export const logoutSchema = refreshSchema;

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatar: z.string().url().optional().nullable(),
  }).refine((data) => data.name || data.avatar !== undefined, {
    message: 'At least one field must be provided',
    path: ['name'],
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
  }),
});
