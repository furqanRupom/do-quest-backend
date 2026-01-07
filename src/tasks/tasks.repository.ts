import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/tasks.schema';
import { Model, Types } from 'mongoose';
import { CreateNewTaskDto, CreateTaskResponseDto } from './dto';

@Injectable()
export class TasksRepository {
    constructor(@InjectModel(Task.name) private taskModel:Model<Task>){}
    async createTask(dto:CreateNewTaskDto,userId:string):Promise<CreateTaskResponseDto>{
        const newTask = await this.taskModel.create({
            ...dto,
            user: new Types.ObjectId(userId),
            deadline:new Date(dto.deadline)
        })
        return {...newTask.toObject(),deadline:newTask.deadline.toISOString()}
    }
}
