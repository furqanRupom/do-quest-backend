import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeModule as NestStripeModule } from '@golevelup/nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/users.repository';
import { StripeController } from './stripe.controller';

@Module({
  imports: [
    NestStripeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        apiKey: config.getOrThrow<string>('stripe.secretKey'),
        apiVersion: '2025-12-15.clover',
      }),
    }),
    UsersModule,
    ConfigModule
  ],
  controllers:[StripeController],
  providers: [StripeService,UsersRepository],
  exports: [StripeService], 
})
export class StripeModule { }
