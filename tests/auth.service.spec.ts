import { RefreshTokenModel } from '../src/database/models/refresh-token.model';
import { UserModel } from '../src/database/models/user.model';
import {
  authenticateUser,
  changeUserPassword,
  refreshTokens,
  registerUser,
  updateUserProfile,
} from '../src/modules/auth/auth.service';

const userPayload = {
  email: 'test@example.com',
  password: 'Password123!',
  name: 'Test User',
};

describe('Auth Service', () => {
  it('registers a new user and returns tokens', async () => {
    const response = await registerUser(
      userPayload.email,
      userPayload.password,
      userPayload.name,
    );

    expect(response.token).toBeDefined();
    expect(response.refreshToken).toBeDefined();
    expect(response.user.email).toBe(userPayload.email);

    const user = await UserModel.findOne({ email: userPayload.email });
    expect(user).toBeTruthy();
    expect(user?.passwordHash).not.toEqual(userPayload.password);

    const tokenDoc = await RefreshTokenModel.findOne({ token: response.refreshToken });
    expect(tokenDoc).toBeTruthy();
  });

  it('authenticates an existing user', async () => {
    await registerUser(userPayload.email, userPayload.password, userPayload.name);

    const response = await authenticateUser(userPayload.email, userPayload.password);
    expect(response.user.email).toBe(userPayload.email);
  });

  it('refreshes tokens and invalidates the previous refresh token', async () => {
    const auth = await registerUser(userPayload.email, userPayload.password, userPayload.name);

    const refreshed = await refreshTokens(auth.refreshToken);

    expect(refreshed.token).not.toEqual(auth.token);
    expect(refreshed.refreshToken).not.toEqual(auth.refreshToken);

    const oldToken = await RefreshTokenModel.findOne({ token: auth.refreshToken });
    expect(oldToken).toBeNull();
  });

  it('updates profile information', async () => {
    const auth = await registerUser(userPayload.email, userPayload.password, userPayload.name);

    const updated = await updateUserProfile(auth.user.id, { name: 'Updated User' });
    expect(updated.name).toBe('Updated User');
  });

  it('changes password and revokes refresh tokens', async () => {
    const auth = await registerUser(userPayload.email, userPayload.password, userPayload.name);

    await changeUserPassword(auth.user.id, userPayload.password, 'NewPassword123!');

    const tokens = await RefreshTokenModel.find({ userId: auth.user.id });
    expect(tokens).toHaveLength(0);
  });
});
