import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Submission } from './schemas/submission.schema';
import { Model } from 'mongoose';
import { CreateSubmissionDto } from './dto';
import { SubmissionStatus } from './enums/submission.enum';

@Injectable()
export class SubmissionRepository {
    constructor(
        @InjectModel(Submission.name) private submissionModel: Model<Submission>,
    ) {}

    createSubmission(dto: CreateSubmissionDto,taskId:string,userId:string): Promise<Submission> {
        return this.submissionModel.create({...dto,task:taskId,user:userId});
    }
    findById(submissionId: string): Promise<Submission | null> {
        return this.submissionModel.findById(submissionId).exec();
    }
    findByTaskId(taskId: string): Promise<Submission[]> {
        return this.submissionModel.find({ task: taskId }).exec();
    }
    findPendingTaskById(taskId: string): Promise<Submission | null> {
        return this.submissionModel
            .findOne({ task: taskId, status: SubmissionStatus.pending })
            .exec();
    }
    rejectSubmission(submissionId: string): Promise<Submission | null> {
        return this.submissionModel
            .findByIdAndUpdate(
                submissionId,
                { status: SubmissionStatus.rejected },
                { new: true },
            )
            .exec();
    }
    approveSubmission(submissionId: string): Promise<Submission | null> {
        return this.submissionModel
            .findByIdAndUpdate(
                submissionId,
                { status: SubmissionStatus.approved },
                { new: true },
            )
            .exec();
    }

    rejectAllExcept(taskId: string, approvedSubmissionId: string) {
        return this.submissionModel.updateMany(
            {
                task: taskId,
                _id: { $ne: approvedSubmissionId },
            },
            { status: SubmissionStatus.rejected },
        );
    }

}
