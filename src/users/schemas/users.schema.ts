import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";


export type UserDocument = HydratedDocument<User>;
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
@Schema({timestamps: true})
export class User {
    @Prop({required: true})
    name: string;
    
    @Prop({unique: true})
    username:string;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({enum: UserRole,default: UserRole.USER})
    role: UserRole;

    @Prop()
    localtion:string;

    @Prop()
    company:string

    @Prop()
    socialLinks:string[];
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

