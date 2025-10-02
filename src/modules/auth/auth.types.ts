import { User } from '../../database/models/user.model';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthenticatedUser;
}

export const mapUserToAuthUser = (user: User): AuthenticatedUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
