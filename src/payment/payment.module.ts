import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TasksModule } from '../tasks/tasks.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports:[StripeModule,TasksModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports:[PaymentService]
})
export class PaymentModule {}
