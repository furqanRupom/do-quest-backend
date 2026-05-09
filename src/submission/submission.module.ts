import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { SubmissionRepository } from './submission.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { StripeModule } from '../stripe/stripe.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Submission.name, schema: SubmissionSchema }]),
    StripeModule, 
    TasksModule
  ],
  providers: [SubmissionService, SubmissionRepository],
  controllers: [SubmissionController],
  exports:[MongooseModule,SubmissionService]
})
export class SubmissionModule { }
