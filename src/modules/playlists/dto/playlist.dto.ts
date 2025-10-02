import { z } from 'zod';

export const trackSchema = z.object({
  trackId: z.string().min(1),
  name: z.string().min(1),
  artist: z.string().min(1),
  imageUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
});

export const createPlaylistSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
    coverImage: z.string().url().optional(),
    tracks: z.array(trackSchema).optional(),
  }),
});

export const updatePlaylistSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
    coverImage: z.string().url().optional().nullable(),
    tracks: z.array(trackSchema).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const playlistIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const addTrackSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: trackSchema,
});

export const removeTrackSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    trackId: z.string().min(1),
  }),
});

export const reorderTracksSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    trackIds: z.array(z.string().min(1)).min(1),
  }),
});

export const listPlaylistsSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
  }),
});

export const searchPlaylistsSchema = z.object({
  query: z.object({
    q: z.string().min(1),
  }),
});
