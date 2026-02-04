import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { SubmissionModule } from '../submission/submission.module';


@Module({
    imports: [
      UsersModule,
      TasksModule,
      SubmissionModule
    ],
    controllers: [AdminController],
    providers: [AdminService, AdminRepository],
})
export class AdminModule { }
