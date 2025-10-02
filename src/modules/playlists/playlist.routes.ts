import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request';
import {
  addTrackHandler,
  createPlaylistHandler,
  deletePlaylistHandler,
  getPlaylistHandler,
  listPlaylistsHandler,
  listPublicPlaylistsHandler,
  removeTrackHandler,
  reorderTracksHandler,
  searchPlaylistsHandler,
  updatePlaylistHandler,
} from './playlist.controller';
import {
  addTrackSchema,
  createPlaylistSchema,
  listPlaylistsSchema,
  playlistIdSchema,
  removeTrackSchema,
  reorderTracksSchema,
  searchPlaylistsSchema,
  updatePlaylistSchema,
} from './dto/playlist.dto';

const router = Router();

router.get('/public', listPublicPlaylistsHandler);
router.get('/search', optionalAuth, validateRequest(searchPlaylistsSchema), searchPlaylistsHandler);

router.use(requireAuth);
router.get('/', validateRequest(listPlaylistsSchema), listPlaylistsHandler);
router.post('/', validateRequest(createPlaylistSchema), createPlaylistHandler);
router.get('/:id', validateRequest(playlistIdSchema), getPlaylistHandler);
router.put('/:id', validateRequest(updatePlaylistSchema), updatePlaylistHandler);
router.delete('/:id', validateRequest(playlistIdSchema), deletePlaylistHandler);
router.post('/:id/tracks', validateRequest(addTrackSchema), addTrackHandler);
router.delete('/:id/tracks/:trackId', validateRequest(removeTrackSchema), removeTrackHandler);
router.put('/:id/reorder', validateRequest(reorderTracksSchema), reorderTracksHandler);

export default router;
