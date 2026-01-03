import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "../../users/schemas/users.schema";

@Schema({timestamps:true})
export class Task {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
    user: Types.ObjectId;

    @Prop({required:true})
    userId:string;
    
    @Prop({required:true})
    title:string;


    @Prop({required:true})
    description:string;

    @Prop({required:true})
    successRequirements:string;

    @Prop({required:false})
    attachments:string

    @Prop({required:true})
    budget:number;

    @Prop({required:true})
    deadline:string;

    @Prop({required:false})
    maxSubmissions:number;

    @Prop({required:true})
    categories: string[];

    @Prop({required:false})
    tags: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task)