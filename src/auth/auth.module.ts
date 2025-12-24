import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[UsersModule],
  providers: [AuthService,AuthRepository],
  controllers: [AuthController]
})
export class AuthModule {}
