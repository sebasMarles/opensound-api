import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes';
import playlistRoutes from '../../modules/playlists/playlist.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/playlists', playlistRoutes);

export default router;
