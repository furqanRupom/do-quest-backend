import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TasksModule } from '../tasks/tasks.module';
import { WalletModule } from '../wallet/wallet.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports:[StripeModule,TasksModule,WalletModule],
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}
