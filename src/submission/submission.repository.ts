import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Model, Types } from 'mongoose';
import { CreateSubmissionDto } from './dto';
import { SubmissionStatus } from './enums/submission.enum';
import { BaseQueryDto } from '../common/dto';
import { QueryBuilder } from '../common/db/query-builder';

@Injectable()
export class SubmissionRepository {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
  ) { }

  async createSubmission(dto: CreateSubmissionDto, taskId: string, userId: string): Promise<Submission> {
    return await this.submissionModel.create({ ...dto, task: taskId, user: userId });
  }
  async findById(submissionId: string): Promise<Submission | null> {
    return await this.submissionModel.findById(submissionId).exec();
  }
  async findByTaskId(taskId: string): Promise<Submission[]> {
    return await this.submissionModel.find({ task: taskId }).exec();
  }
  async findPendingTaskById(taskId: string): Promise<Submission | null> {
    return await this.submissionModel
      .findOne({ task: taskId, status: SubmissionStatus.pending })
      .exec();
  }
  async existingSubmission(taskId: string, userId: string): Promise<SubmissionDocument | null> {
    return await this.submissionModel.findOne({
      task: new Types.ObjectId(taskId),
      user: new Types.ObjectId(userId),
      status: { $in: [SubmissionStatus.pending, SubmissionStatus.approved] }
    })
  }
  async getSubmissionsByTaskId(taskId:string) {
    return await this.submissionModel.find({task:new Types.ObjectId(taskId)}).populate('user','nam email userStripeId payoutsEnabled').lean()
  }
  async rejectSubmission(submissionId: string): Promise<Submission | null> {
    return await this.submissionModel
      .findByIdAndUpdate(
        submissionId,
        { status: SubmissionStatus.rejected },
        { new: true },
      )
      .exec();
  }
  async approveSubmission(submissionId: string): Promise<Submission | null> {
    return await this.submissionModel
      .findByIdAndUpdate(
        submissionId,
        { status: SubmissionStatus.approved },
        { new: true },
      )
      .exec();
  }

  async rejectAllExcept(taskId: string, approvedSubmissionId: string) {
    return await this.submissionModel.updateMany(
      {
        task: taskId,
        _id: { $ne: approvedSubmissionId },
      },
      { status: SubmissionStatus.rejected },
    );
  }


  async countTotalSubmissions(): Promise<number> {
    return await this.submissionModel.countDocuments().exec();
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
}
