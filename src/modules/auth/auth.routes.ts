import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request';
import {
  changePasswordHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
  updateProfileHandler,
} from './auth.controller';
import {
  changePasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from './dto/auth.dto';

const router = Router();

router.post('/register', validateRequest(registerSchema), registerHandler);
router.post('/login', validateRequest(loginSchema), loginHandler);
router.post('/refresh', validateRequest(refreshSchema), refreshHandler);
router.post('/logout', validateRequest(logoutSchema), logoutHandler);
router.get('/me', requireAuth, meHandler);
router.put('/profile', requireAuth, validateRequest(updateProfileSchema), updateProfileHandler);
router.put('/change-password', requireAuth, validateRequest(changePasswordSchema), changePasswordHandler);

export default router;
