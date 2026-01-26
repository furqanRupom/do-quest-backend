import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/users.schema';
import { Submission } from '../submission/schemas/submission.schema';
import { Task } from '../tasks/schemas/tasks.schema';
import { BaseQueryDto } from '../common/dto';
import { QueryBuilder } from 'src/common/db/query-builder';

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

    // TODO: we will add return type later
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

    // TODO: we will add return type later
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

    // TODO: we will add return type later
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
}
