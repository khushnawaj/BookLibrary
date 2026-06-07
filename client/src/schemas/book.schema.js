import { z } from 'zod';

const urlSchema = z.string().url('Must be a valid URL').or(z.literal(''));

const purchaseLinkSchema = z.object({
  platform: z.string().min(1, 'Platform name is required').max(50),
  url: z.string().url('Must be a valid URL'),
});

export const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(300, 'Title cannot exceed 300 characters'),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(200, 'Author name cannot exceed 200 characters'),
  publisher: z.string().max(200).optional().or(z.literal('')),
  publicationDate: z.string().optional().or(z.literal('')),
  isbn: z
    .string()
    .regex(/^(?:\d[- ]?){13}$|^(?:\d[- ]?){10}$|^[\dX-]{10,17}$/i, 'Invalid ISBN format')
    .optional()
    .or(z.literal('')),
  genre: z.string().max(100).optional().or(z.literal('')),
  language: z.string().max(50).optional().or(z.literal('')),
  pages: z
    .union([z.number().int().min(1).max(50000), z.nan(), z.undefined()])
    .optional()
    .nullable(),
  coverImage: urlSchema.optional().nullable(),
  description: z.string().max(5000).optional().or(z.literal('')),
  purchaseLinks: z.array(purchaseLinkSchema).max(10).optional(),
});

export const libraryEntrySchema = z.object({
  shelfType: z.enum(['READ', 'READING', 'WISHLIST', 'DROPPED'], {
    required_error: 'Please select a shelf',
  }),
  rating: z
    .union([z.number().min(1).max(5), z.nan(), z.undefined()])
    .optional()
    .nullable(),
  notes: z.string().max(5000).optional().or(z.literal('')),
  review: z.string().max(2000).optional().or(z.literal('')),
  startedAt: z.string().optional().or(z.literal('')),
  finishedAt: z.string().optional().or(z.literal('')),
});
