import ms from 'ms';
import type { StringValue } from 'ms';
import { FilterQuery } from 'mongoose';
import { RefreshTokenModel } from '../../database/models/refresh-token.model';
import { User, UserModel } from '../../database/models/user.model';
import { getEnv } from '../../config/env';
import { logger } from '../../config/logger';
import { comparePassword, hashPassword } from '../../utils/password';
import {
  JwtPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { AuthResponse, mapUserToAuthUser } from './auth.types';

const env = getEnv();

const REFRESH_TTL_MS = ms(env.REFRESH_TOKEN_TTL as StringValue);

if (typeof REFRESH_TTL_MS !== 'number') {
  throw new Error('Invalid REFRESH_TOKEN_TTL value');
}

interface IssueTokenOptions {
  user: User;
  userAgent?: string;
  existingToken?: string;
}

const issueTokens = async ({
  user,
  userAgent,
  existingToken,
}: IssueTokenOptions): Promise<AuthResponse> => {
  const payload: JwtPayload = { sub: user.id, email: user.email };
  const token = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  if (existingToken) {
    await RefreshTokenModel.deleteOne({ token: existingToken });
  }

  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  await RefreshTokenModel.create({
    token: refreshToken,
    userId: user._id,
    expiresAt,
    userAgent,
  });

  return {
    token,
    refreshToken,
    expiresIn: env.ACCESS_TOKEN_TTL,
    user: mapUserToAuthUser(user),
  };
};

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  avatar?: string,
  userAgent?: string,
): Promise<AuthResponse> => {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    (error as Error & { statusCode: number }).statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    email,
    passwordHash,
    name,
    avatar,
  });

  logger.info({ email }, 'User registered');

  return issueTokens({ user, userAgent });
};

export const authenticateUser = async (
  email: string,
  password: string,
  userAgent?: string,
): Promise<AuthResponse> => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }

  return issueTokens({ user, userAgent });
};

export const refreshTokens = async (
  refreshToken: string,
  userAgent?: string,
): Promise<AuthResponse> => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenDoc = await RefreshTokenModel.findOne({ token: refreshToken }).populate('userId');

  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    const error = new Error('Refresh token expired');
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }

  const user = tokenDoc.userId as unknown as User;

  if (user.id !== payload.sub) {
    const error = new Error('Refresh token invalid for user');
    (error as Error & { statusCode: number }).statusCode = 401;
    await RefreshTokenModel.deleteOne({ token: refreshToken });
    throw error;
  }

  return issueTokens({ user, userAgent, existingToken: refreshToken });
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  await RefreshTokenModel.deleteOne({ token: refreshToken });
};

export const getUserProfile = async (userId: string): Promise<AuthResponse['user']> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }
  return mapUserToAuthUser(user);
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<User, 'name' | 'avatar'>> & { avatar?: string | null },
): Promise<AuthResponse['user']> => {
  const payload: Partial<User> = { ...updates };
  if (updates.avatar === null) {
    payload.avatar = undefined;
  }

  const user = await UserModel.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  return mapUserToAuthUser(user);
};

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    const error = new Error('Current password is incorrect');
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await RefreshTokenModel.deleteMany({ userId: user._id });
};

export const revokeTokensByQuery = async (query: FilterQuery<unknown>): Promise<void> => {
  await RefreshTokenModel.deleteMany(query);
};
