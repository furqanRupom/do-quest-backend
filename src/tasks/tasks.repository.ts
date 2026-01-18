import { ConsoleLogger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/tasks.schema';
import { Model, Types } from 'mongoose';
import { CreateNewTaskDto, CreateTaskResponseDto } from './dto';
import { QueryBuilder } from '../common/db/query-builder';
import { MetaResponseDto } from '../common/dto';

@Injectable()
export class TasksRepository {
    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) { }
    async createTask(dto: CreateNewTaskDto, userId: string): Promise<CreateTaskResponseDto> {
        const newTask = await this.taskModel.create({
            ...dto,
            user: new Types.ObjectId(userId),
            deadline: new Date(dto.deadline)
        })
        return { ...newTask.toObject(), deadline: newTask.deadline.toISOString() }
    }

    async deleteTask(taskId: string, userId: string): Promise<void> {
        if (!Types.ObjectId.isValid(taskId)) {
            throw new HttpException('Invalid task ID format', HttpStatus.BAD_REQUEST);
        }

        const task = await this.taskModel.findById(taskId);

        if (!task) {
            throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }
        if (task.isDeleted) {
            throw new HttpException('Task already deleted', HttpStatus.BAD_REQUEST);
        }


        if (task.user.toString() !== userId) {
            throw new HttpException(
                'You are not authorized to delete this task',
                HttpStatus.FORBIDDEN,
            );
        }

        task.isDeleted = true;
        await task.save();
    }

    async getAllTasks(userId:string,query:Record<string,unknown>): Promise<MetaResponseDto<Partial<CreateTaskResponseDto>>> {
        const builder =  new QueryBuilder(this.taskModel,query)
        .search(['title','description'])
        .filter()
        .sort()
        .paginate()
        .fields();
        const data = await builder.modelQuery.find({user:new Types.ObjectId(userId),isDeleted:false}).lean() 
        const meta = await builder.countTotal();
        return { data, meta };
       
    }

    // TODO: we will fixed any type to our response type
    async getTaskById(taskId: string): Promise<any> {
        const task = await this.taskModel.findById(taskId);
        if (!task) {
            throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }
        if (!task.isDeleted){
            throw new HttpException('Task is deleted',HttpStatus.BAD_REQUEST)
        }
        return task.toJSON()
    }

}
