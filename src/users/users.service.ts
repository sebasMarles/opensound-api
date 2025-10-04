import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SafeUser, User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: bcrypt.hashSync('admin123', 10),
      roles: ['admin'],
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'Regular User',
      passwordHash: bcrypt.hashSync('user123', 10),
      roles: ['user'],
    },
  ];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    return isPasswordValid ? user : null;
  }

  sanitizeUser(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
