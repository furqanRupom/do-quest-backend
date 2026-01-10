import { ConsoleLogger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/tasks.schema';
import { Model, Types } from 'mongoose';
import { CreateNewTaskDto, CreateTaskResponseDto } from './dto';

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

    async getAllTasks(userId:string): Promise<CreateTaskResponseDto[]> {
        // TODO: We will implement a robust query builder later. For now, we will fetch all tasks for the user.
        // TODO: some fixes like userId is geting the following tasks
        const tasks = await this.taskModel.find();
        return tasks.map(task => ({ ...task.toObject(), deadline: task.deadline.toISOString() }));
    }
}
