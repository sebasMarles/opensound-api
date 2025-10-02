import 'express';
import { AuthenticatedUser } from '../../modules/auth/auth.types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    refreshToken?: string;
  }
}
