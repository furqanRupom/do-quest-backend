import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/users.schema';
import { Submission } from '../submission/schemas/submission.schema';
import { Task } from '../tasks/schemas/tasks.schema';
import { BaseQueryDto } from '../common/dto';
import { QueryBuilder } from '../common/db/query-builder';
import { TaskStatus } from '../tasks/enums/tasks.enum';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) { }

  async countTotalUsers(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async countTotalSubmissions(): Promise<number> {
    return this.submissionModel.countDocuments().exec();
  }

  async countTotalTasks(): Promise<number> {
    return this.taskModel.countDocuments().exec();
  }

  async getAllUsers(query: BaseQueryDto) {
    const users = new QueryBuilder(this.userModel, query)
      .search(['name', 'email'])
      .filter()
      .sort()
      .paginate()
      .fields();
    const data = await users.modelQuery;
    const meta = await users.countTotal();
    return { data, meta };
  }

  async getAllSubmissions(query: BaseQueryDto) {
    const submissions = new QueryBuilder(this.submissionModel, query)
      .search(['title', 'content'])
      .filter()
      .sort()
      .paginate()
      .fields();
    const data = await submissions.modelQuery;
    const meta = await submissions.countTotal();
    return { data, meta };
  }

  async getAllTasks(query: BaseQueryDto) {
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

  async updateUser(userId:string,userUpdateDto: any) {
    const user = await this.userModel.findById(userId)

    if(!user) {
      throw new NotFoundException("User not found")
    }
    return await this.userModel.findByIdAndUpdate(userId,userUpdateDto,{new:true})
  }
}
