import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SafeUser } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
    const user = await this.usersService.validateCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, roles: user.roles };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') ?? '1h',
    });

    return {
      user: this.usersService.sanitizeUser(user),
      token,
    };
  }

  async signOut() {
    return { message: 'Sesión cerrada correctamente' };
  }
}
