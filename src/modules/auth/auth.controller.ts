import { Request, Response } from 'express';
import {
  authenticateUser,
  changeUserPassword,
  getUserProfile,
  logoutUser,
  refreshTokens,
  registerUser,
  updateUserProfile,
} from './auth.service';
import { createSuccessResponse } from '../../utils/response';

const getUserAgent = (req: Request): string | undefined => req.get('user-agent') || undefined;

export const registerHandler = async (req: Request, res: Response) => {
  const { email, password, name, avatar } = req.body;
  const auth = await registerUser(email, password, name, avatar, getUserAgent(req));
  res.status(201).json(createSuccessResponse(auth));
};

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const auth = await authenticateUser(email, password, getUserAgent(req));
  res.json(createSuccessResponse(auth));
};

export const refreshHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const auth = await refreshTokens(refreshToken, getUserAgent(req));
  res.json(createSuccessResponse(auth));
};

export const logoutHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await logoutUser(refreshToken);
  res.json(createSuccessResponse({} as Record<string, never>, 'Logged out successfully'));
};

export const meHandler = async (req: Request, res: Response) => {
  const user = await getUserProfile(req.user!.id);
  res.json(createSuccessResponse(user));
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  const { name, avatar } = req.body;
  const updates: { name?: string; avatar?: string | null } = {};
  if (name !== undefined) updates.name = name;
  if (avatar !== undefined) updates.avatar = avatar;
  const user = await updateUserProfile(req.user!.id, updates);
  res.json(createSuccessResponse(user, 'Profile updated'));
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await changeUserPassword(req.user!.id, currentPassword, newPassword);
  res.json(createSuccessResponse({} as Record<string, never>, 'Password updated'));
};
