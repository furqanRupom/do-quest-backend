import { Prop, Schema } from "@nestjs/mongoose";

@Schema({timestamps:true})
export class Task {
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