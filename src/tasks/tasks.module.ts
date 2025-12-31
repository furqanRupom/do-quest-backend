import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TasksController } from './tasks.controller';

@Module({
    imports:[],
    providers:[TasksService,TasksRepository],
    controllers:[TasksController]
})
export class TasksModule {}
