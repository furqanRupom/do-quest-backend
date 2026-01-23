import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Task } from "../../tasks/schemas/tasks.schema";
import { User } from "../../users/schemas/users.schema";
import { SubmissionStatus } from "../enums/submission.enum";



@Schema({ timestamps: true })
export class Submission {
    @Prop({ type: Types.ObjectId, ref: Task.name, required: true, index: true })
    task: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
    user: Types.ObjectId;

    @Prop({ type: String, required: true })
    message: string;

    @Prop({ type: [String], required: true })
    attachments: string[];

    @Prop({ type: String, enum: Object.values(SubmissionStatus), default: SubmissionStatus.pending, index: true })
    status: SubmissionStatus;

}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);