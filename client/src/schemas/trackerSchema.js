import { z } from 'zod';

export const TRACKER_STATUS_OPTIONS = [
  { id: 'IDEA', label: 'Idea', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { id: 'OUTLINING', label: 'Outlining', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { id: 'DRAFTING', label: 'Drafting', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { id: 'EDITING', label: 'Editing', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30' },
  { id: 'ABANDONED', label: 'Abandoned', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
];

export const TRACKER_CONTENT_TYPES = [
  { id: 'NOVEL', label: 'Novel' },
  { id: 'STORY', label: 'Short Story' },
  { id: 'POEM', label: 'Poetry' },
  { id: 'SERIAL', label: 'Web Serial' },
  { id: 'OTHER', label: 'Other' },
];

export const createTrackerSchema = z
  .object({
    workId: z.string().optional().nullable(),
    title: z.string().trim().max(200, 'Title cannot exceed 200 characters').optional(),
    contentType: z.enum(['STORY', 'POEM', 'NOVEL', 'SERIAL', 'OTHER']).default('NOVEL'),
    genre: z.string().trim().optional().default('General'),
    language: z.string().trim().optional().default('English'),
    trackerStatus: z
      .enum(['IDEA', 'OUTLINING', 'DRAFTING', 'EDITING', 'COMPLETED', 'ON_HOLD', 'ABANDONED'])
      .default('DRAFTING'),
    plannedChapters: z.coerce.number().min(0).optional().nullable(),
    drafted: z.coerce.number().min(0).default(0),
    edited: z.coerce.number().min(0).default(0),
    published: z.coerce.number().min(0).default(0),
    whereILeftOff: z.string().trim().max(2000).optional().default(''),
    nextAction: z.string().trim().max(1000).optional().default(''),
    priority: z.coerce.number().min(1).default(1),
  })
  .refine(
    (data) => {
      if (!data.workId && (!data.title || data.title.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Title is required when creating an external project tracker',
      path: ['title'],
    }
  );

export const writingLogSchema = z.object({
  wordsWritten: z.coerce
    .number({ invalid_type_error: 'Please enter a valid word count' })
    .min(0, 'Word count cannot be negative'),
  note: z.string().trim().max(1000, 'Note cannot exceed 1000 characters').optional().default(''),
  date: z.string().optional(),
});
