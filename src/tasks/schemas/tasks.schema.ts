import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "../../users/schemas/users.schema";
import { PaymentStatus, TaskStatus } from "../enums/tasks.enum";


@Schema({ timestamps: true })
export class Task {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
    user: Types.ObjectId;

    @Prop({ type:String, required: true })
    title: string;

    @Prop({ type:String, required: true })
    description: string;

    @Prop({type:[String], required: true })
    successRequirements: string[];

    @Prop({type:String, required: false })
    attachments: string

    @Prop({type:Number, required: true })
    budget: number;

    @Prop({type:Date, required: true })
    deadline: Date;

    @Prop({type:Number, required: false })
    maxSubmissions: number;

    @Prop({ enum: Object.values(TaskStatus) ,required: true, default: TaskStatus.pending,index:true })
    status: TaskStatus

    @Prop({ enum: Object.values(PaymentStatus), required: true, default: PaymentStatus.active })
    paymentStatus: PaymentStatus

    @Prop({type:[String], required: true })
    categories: string[];

    @Prop({type:[String], required: false })
    tags: string[];
    
    @Prop({ type: Boolean, default:false})
    isDeleted: boolean;

}

export const TaskSchema = SchemaFactory.createForClass(Task)