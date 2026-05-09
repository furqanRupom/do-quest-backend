import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})

export class StripeModule { }
