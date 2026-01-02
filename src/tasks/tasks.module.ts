import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TasksController } from './tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/tasks.schema';

@Module({
    imports:[MongooseModule.forFeature([{name:Task.name,schema:TaskSchema}])],
    providers:[TasksService,TasksRepository],
    controllers:[TasksController],
    exports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])]
})
export class TasksModule {}
