import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../tasks/schemas/tasks.schema';
import { Submission, SubmissionSchema } from '../submission/schemas/submission.schema';
import { User, UserSchema } from '../users/schemas/users.schema';
import { DashboardRepository } from './dashboard.repository';
import { WalletTransaction, WalletTransactionSchema } from '../wallet/schemas/wallet-transaction.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: User.name, schema: UserSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema }
    ])
  ],
  providers: [DashboardService, DashboardRepository],
  controllers: [DashboardController]
})
export class DashboardModule { }
