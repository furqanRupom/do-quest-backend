import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/tasks.schema';
import { Model, Types } from 'mongoose';
import { CreateNewTaskDto, CreateTaskResponseDto, UpdateTaskDto } from './dto';
import { QueryBuilder } from '../common/db/query-builder';
import { BaseQueryDto, MetaResponseDto } from '../common/dto';
import { PaymentFlowStatus, TaskStatus } from './enums/tasks.enum';
import { SubmissionStatus } from 'src/submission/enums/submission.enum';

@Injectable()
export class TasksRepository {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) { }
  async createTask(
    dto: CreateNewTaskDto,
    userId: string,
  ): Promise<CreateTaskResponseDto> {
    const newTask = await this.taskModel.create({
      ...dto,
      user: new Types.ObjectId(userId),
      deadline: new Date(dto.deadline),
    });
    return { ...newTask.toObject(), deadline: newTask.deadline.toISOString() };
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
    if(task.status == TaskStatus.active) {
      throw new HttpException('Cannot delete an active task, Delete it first!',HttpStatus.BAD_REQUEST)
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

  async getAllTasks(
    userId: string,
    query: BaseQueryDto,
  ): Promise<MetaResponseDto<Partial<CreateTaskResponseDto>>> {
    const builder = new QueryBuilder(this.taskModel, query)
      .search(['title', 'description'])
      .filter()
      .sort()
      .paginate()
      .fields();
    const data = await builder.modelQuery
      .find({ user: new Types.ObjectId(userId), isDeleted: false })
      .lean();
    const meta = await builder.countTotal();
    return { data, meta };
  }

  async getTaskById(taskId: string): Promise<Partial<CreateTaskResponseDto>> {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    if (task.isDeleted) {
      throw new HttpException('Task is deleted', HttpStatus.BAD_REQUEST);
    }
    return { ...task.toObject(), deadline: task.deadline.toISOString() };
  }

  async findTaskById(taskId: string): Promise<Task | null> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    if (task.isDeleted) {
      throw new HttpException('Task is deleted', HttpStatus.BAD_REQUEST);
    }
    return task;
  }

  async updateTask(
    taskId: string,
    updateData: {
      status: TaskStatus;
      paymentFlowStatus: PaymentFlowStatus;
      paymentIntentId?: string;
    },
  ): Promise<Task | null> {
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true },
    );
    if (!updatedTask) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return updatedTask;
  }

  async updateWholeTask(
    taskId: string,
    userId: string,
    updateData: Partial<UpdateTaskDto>,
  ): Promise<Task | null> {
    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: taskId, user: userId },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedTask) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    return updatedTask;
  }



  async countTotalTasks(): Promise<number> {
    return this.taskModel.countDocuments().exec();
  }
  async getAllTasksAdmin(query: BaseQueryDto) {
    const tasks = new QueryBuilder(this.taskModel, query)
      .search(['title', 'description'])
      .filter()
      .sort()
      .paginate()
      .fields();
    const data = await tasks.modelQuery;
    const meta = await tasks.countTotal();
    return { data, meta };
  }
  async getTasksBountiesBarData() {
    return await this.taskModel.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          count: 1,
        },
      },
    ]);
  }

  async updateTaskStatus(
    taskId: string,
    taskStatusDto: { taskStatus: TaskStatus },
  ) {
    const task = await this.taskModel.findOne({ _id: taskId });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.isDeleted) {
      throw new BadRequestException('Task is deleted!');
    }
    return await this.taskModel.findByIdAndUpdate(
      taskId,
      { status: taskStatusDto.taskStatus },
      { new: true },
    );
  }
  async incrementApprovedSubmissions(taskId: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(taskId)
    if (!task) {
      throw new NotFoundException("Task not found!")
    }
    const approvedCount = await this.taskModel.db.collection('submissions').countDocuments({
      task: new Types.ObjectId(task._id),
      status: SubmissionStatus.approved
    })

    if (approvedCount >= task.maxSubmissions) {
      task.status = TaskStatus.completed
      await task.save()
    }
    return task.toObject() as unknown as TaskDocument
  }
}
