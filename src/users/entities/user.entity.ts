import { Role } from '../../common/decorators/roles.decorator';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: Role[];
}

export type SafeUser = Omit<User, 'passwordHash'>;
