import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TasksModule } from '../tasks/tasks.module';
import { StripeModule } from '../stripe/stripe.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[StripeModule,TasksModule, UsersModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports:[PaymentService]
})
export class PaymentModule {}
