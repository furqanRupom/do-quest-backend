import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { User } from "../../users/schemas/users.schema";
import { PaymentFlowStatus, PaymentStatus, TaskStatus } from "../enums/tasks.enum";

export type TaskDocument = Task & Document
@Schema({ timestamps: true })
export class Task {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
    user: Types.ObjectId = new mongoose.Types.ObjectId();

    @Prop({ type:String, required: true })
    title: string = '';

    @Prop({ type:String, required: true })
    description: string = '';

    @Prop({type:[String], required: true })
    successRequirements: string[] = [];

    @Prop({type:String, required: false })
    attachments: string = ''

    @Prop({type:Number, required: true })
    budget: number = 0;

    @Prop({type:Date, required: true })
    deadline: Date = new Date();

    @Prop({type:Number, required: false })
    maxSubmissions: number = 1;

    @Prop({ type: String, enum: Object.values(TaskStatus), required: true, default: TaskStatus.pending,index:true })
    status: TaskStatus = TaskStatus.pending

    @Prop({ type: String, enum: Object.values(PaymentStatus), required: true, default: PaymentStatus.active })
    paymentStatus: PaymentStatus = PaymentStatus.active

    @Prop({type:[String], required: true })
    categories: string[] = [];

    @Prop({type:[String], required: false })
    tags: string[] = [];

    @Prop({ type: String })
    paymentIntentId?: string;

    @Prop({ type: String, enum: Object.values(PaymentFlowStatus), default: PaymentFlowStatus.no_payment })
    paymentFlowStatus: string = '';
    
    @Prop({ type: Boolean, default:false})
    isDeleted: boolean = false;

}

export const TaskSchema = SchemaFactory.createForClass(Task)
