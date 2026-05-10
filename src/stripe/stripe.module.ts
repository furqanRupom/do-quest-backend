import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { StripeController } from './stripe.controller';
import { WalletModule } from '../wallet/wallet.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [ConfigModule, UsersModule, forwardRef(()=> WalletModule), TasksModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})

export class StripeModule { }
