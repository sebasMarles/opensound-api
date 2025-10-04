import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProfileController } from './profile.controller';

@Module({
  controllers: [ProfileController],
  providers: [JwtAuthGuard],
})
export class ProfileModule {}
