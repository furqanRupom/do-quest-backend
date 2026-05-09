import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TasksController } from './tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/tasks.schema';
import { StripeModule } from '../stripe/stripe.module';
import { WalletModule } from '../wallet/wallet.module';
import { WalletRepository } from '../wallet/wallet.repository';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        StripeModule,
        WalletModule 
    ],
    providers: [TasksService, TasksRepository,WalletRepository], 
    controllers: [TasksController],
    exports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), TasksRepository],
})
export class TasksModule { }
