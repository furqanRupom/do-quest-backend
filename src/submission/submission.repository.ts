import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Model, Types } from 'mongoose';
import { CreateSubmissionDto } from './dto';
import { SubmissionStatus } from './enums/submission.enum';
import { BaseQueryDto } from '../common/dto';
import { QueryBuilder } from '../common/db/query-builder';
import { RejectSubmissionDto } from './dto/reject-submission.dto';
import { SubmissionFilterableFields } from './constants/submission.constant';
import { SubmissionQueryDto } from './dto/submission.list.dto';
@Injectable()
export class SubmissionRepository {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
  ) { }

  async createSubmission(dto: CreateSubmissionDto, taskId: string, userId: string): Promise<Submission> {
    return await this.submissionModel.create({ ...dto, task: taskId, user: userId });
  }


  async findById(submissionId: string): Promise<Submission | null> {
    return await this.submissionModel
      .findById(submissionId)
      .populate({
        path: 'task',
        select: 'title description status',   
      })
      .populate({
        path: 'user',
        select: 'name email username',       
      })
      .exec();
  } async findByTaskId(taskId: string): Promise<Submission[]> {
    return await this.submissionModel.find({ task: taskId }).exec();
  }
  async findPendingTaskById(taskId: string): Promise<Submission | null> {
    return await this.submissionModel
      .findOne({ task: taskId, status: SubmissionStatus.pending })
      .exec();
  }
  async existingSubmission(taskId: string, userId: string): Promise<SubmissionDocument | null> {
    return await this.submissionModel.findOne({
      task: taskId,
      user: userId,
      status: { $ne: SubmissionStatus.rejected }
    })
  }
  async getSubmissionsByTaskId(taskId: string) {
    return await this.submissionModel.find({ task: new Types.ObjectId(taskId) }).populate('user', 'nam email userStripeId payoutsEnabled').lean()
  }
  async rejectSubmission(submissionId: string, payload: RejectSubmissionDto): Promise<Submission | null> {
    return await this.submissionModel
      .findByIdAndUpdate(
        submissionId,
        { status: SubmissionStatus.rejected, rejectionReason: payload.rejectionReason },
        { new: true },
      )
      .exec();
  }

  async revisionSubmission(submissionId: string, revisionNote: string) {
    return await this.submissionModel.findByIdAndUpdate(
      submissionId,
      { status: SubmissionStatus.revision_requested, revisionNote: revisionNote },
      { new: true }
    )
      .exec()
  }


  async approveSubmission(submissionId: string, stripeTransferId: string): Promise<Submission | null> {
    return await this.submissionModel
      .findByIdAndUpdate(
        submissionId,
        { status: SubmissionStatus.approved, stripeTransferId: stripeTransferId },
        { new: true },
      )
      .exec();
  }
  async resubmitSubmission(submissionId: string, dto: CreateSubmissionDto) {
    return await this.submissionModel.findByIdAndUpdate(submissionId,
      {
        status: SubmissionStatus.pending, revisionNote: "",
        message: dto.message,
        attachments: dto.attachments
      },
      { new: true })
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
  async getAllSubmissions(query: SubmissionQueryDto) {
    const submissions = new QueryBuilder(this.submissionModel, query)
      .search(['title', 'content'])
      .filter(SubmissionFilterableFields)
      .sort()
      .paginate()
      .fields();
    const data = await submissions.modelQuery;
    const meta = await submissions.countTotal();
    return { data, meta };
  }


  async getMySubmissions(userId: string, query: SubmissionQueryDto) {
    const submissions = new QueryBuilder(this.submissionModel, query)
      .search(['title', 'content'])
      .filter(SubmissionFilterableFields, { user: new Types.ObjectId(userId) })
      .sort()
      .paginate()
      .populate({
        path: 'task',
        select: 'title budget status deadline'
      })
      .fields();
    const data = await submissions.modelQuery;
    const meta = await submissions.countTotal();
    return { data, meta };
  }


  
  async getSubmissionsByTasksId(taskId: string, query: SubmissionQueryDto) {
    const submissions = new QueryBuilder(this.submissionModel, query)
      .search(['title', 'content'])
      .filter(SubmissionFilterableFields, { task: new Types.ObjectId(taskId) })
      .sort()
      .paginate()
      .populate({
        path: 'task',
        select: 'title budget status deadline'
      })
      .fields();
    const data = await submissions.modelQuery;
    const meta = await submissions.countTotal();
    return { data, meta };
  }
}
